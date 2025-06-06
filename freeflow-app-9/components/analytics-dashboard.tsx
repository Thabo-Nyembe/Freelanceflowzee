'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Activity, 
  AlertTriangle,
  Brain,
  Zap,
  Target,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Settings,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Star,
  Lightbulb,
  Rocket,
  Shield
} from 'lucide-react'
import { useAnalytics } from '@/lib/analytics-enhanced'

interface AnalyticsDashboardProps {
  userId?: string
  timeRange?: '24h' | '7d' | '30d' | '90d' | '1y'
  showAIInsights?: boolean
}

export function AnalyticsDashboard({ 
  userId, 
  timeRange = '30d', 
  showAIInsights = true 
}: AnalyticsDashboardProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState('overview')
  const [realTimeData, setRealTimeData] = useState<any>({})
  const [aiInsights, setAIInsights] = useState<any>({})
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [userBehaviorData, setUserBehaviorData] = useState<any[]>([])
  const [revenueData, setRevenueData] = useState<any[]>([])
  const [conversionData, setConversionData] = useState<any[]>([])
  const [errorData, setErrorData] = useState<any[]>([])
  const [cohortData, setCohortData] = useState<any[]>([])
  
  const analytics = useAnalytics()

  useEffect(() => {
    loadDashboardData()
    
    // Set up real-time updates
    const interval = setInterval(updateRealTimeData, 30000) // 30 seconds
    
    return () => clearInterval(interval)
  }, [timeRange, userId])

  const loadDashboardData = async () => {
    setIsLoading(true)
    
    try {
      // Simulate loading comprehensive analytics data
      const [
        insights,
        performance,
        behavior,
        revenue,
        conversions,
        errors,
        cohorts
      ] = await Promise.all([
        analytics.generateInsights(),
        loadPerformanceData(),
        loadUserBehaviorData(),
        loadRevenueData(),
        loadConversionData(),
        loadErrorData(),
        loadCohortData()
      ])

      setAIInsights(insights)
      setPerformanceData(performance)
      setUserBehaviorData(behavior)
      setRevenueData(revenue)
      setConversionData(conversions)
      setErrorData(errors)
      setCohortData(cohorts)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateRealTimeData = async () => {
    try {
      const realTime = await loadRealTimeMetrics()
      setRealTimeData(realTime)
    } catch (error) {
      console.error('Failed to update real-time data:', error)
    }
  }

  // Sample data generators (in production, these would fetch from APIs)
  const loadPerformanceData = async () => {
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (29 - i))
      return {
        date: date.toISOString().split('T')[0],
        lcp: 1200 + Math.random() * 800,
        fcp: 800 + Math.random() * 400,
        cls: Math.random() * 0.3,
        inp: 80 + Math.random() * 120,
        ttfb: 200 + Math.random() * 300,
        pageviews: Math.floor(1000 + Math.random() * 5000),
        bounceRate: 0.2 + Math.random() * 0.4,
        sessionDuration: 120 + Math.random() * 480
      }
    })
    return days
  }

  const loadUserBehaviorData = async () => {
    return [
      { name: 'Landing Page', users: 4000, engagement: 24, conversions: 2400 },
      { name: 'Dashboard', users: 3000, engagement: 45, conversions: 2210 },
      { name: 'Projects', users: 2000, engagement: 67, conversions: 2290 },
      { name: 'Payment', users: 2780, engagement: 89, conversions: 2000 },
      { name: 'Profile', users: 1890, engagement: 34, conversions: 2181 },
      { name: 'Settings', users: 2390, engagement: 23, conversions: 2500 },
    ]
  }

  const loadRevenueData = async () => {
    const months = Array.from({ length: 12 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (11 - i))
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: 10000 + Math.random() * 50000,
        profit: 5000 + Math.random() * 25000,
        subscriptions: 100 + Math.random() * 500,
        churn: Math.random() * 0.1,
        ltv: 1000 + Math.random() * 5000
      }
    })
    return months
  }

  const loadConversionData = async () => {
    return [
      { step: 'Visitor', users: 10000, rate: 100 },
      { step: 'Sign Up', users: 3000, rate: 30 },
      { step: 'Trial', users: 2100, rate: 21 },
      { step: 'Paid', users: 630, rate: 6.3 },
      { step: 'Loyal', users: 315, rate: 3.15 },
    ]
  }

  const loadErrorData = async () => {
    return [
      { type: 'JavaScript', count: 45, severity: 'high' },
      { type: 'Network', count: 123, severity: 'medium' },
      { type: 'API', count: 67, severity: 'high' },
      { type: 'UI', count: 23, severity: 'low' },
      { type: 'Performance', count: 89, severity: 'medium' },
    ]
  }

  const loadCohortData = async () => {
    return Array.from({ length: 8 }, (_, week) => {
      const retention = Array.from({ length: 8 }, (_, i) => {
        if (i > week) return null
        const baseRetention = 100 - (i * 10) - Math.random() * 20
        return Math.max(0, baseRetention)
      })
      return {
        cohort: `Week ${week + 1}`,
        size: 100 + Math.random() * 500,
        retention
      }
    })
  }

  const loadRealTimeMetrics = async () => {
    return {
      activeUsers: 1234 + Math.floor(Math.random() * 500),
      pagesPerSecond: 12.3 + Math.random() * 5,
      conversionRate: 3.4 + Math.random() * 2,
      averageRevenue: 45.67 + Math.random() * 20,
      systemHealth: 98.5 + Math.random() * 1.5,
      apiResponseTime: 120 + Math.random() * 80
    }
  }

  const kpiCards = useMemo(() => [
    {
      title: 'Active Users',
      value: realTimeData.activeUsers || 1234,
      change: '+12.5%',
      trend: 'up' as const,
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Revenue',
      value: `$${realTimeData.averageRevenue?.toFixed(2) || '45.67'}k`,
      change: '+8.2%',
      trend: 'up' as const,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Conversion Rate',
      value: `${realTimeData.conversionRate?.toFixed(1) || '3.4'}%`,
      change: '-0.3%',
      trend: 'down' as const,
      icon: Target,
      color: 'orange'
    },
    {
      title: 'System Health',
      value: `${realTimeData.systemHealth?.toFixed(1) || '98.5'}%`,
      change: '+0.1%',
      trend: 'up' as const,
      icon: Activity,
      color: 'purple'
    }
  ], [realTimeData])

  const chartColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1']

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">
            AI-powered insights and real-time performance monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={() => updateRealTimeData()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {kpi.title}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 text-${kpi.color}-500`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
              <div className="flex items-center text-xs text-gray-500">
                {kpi.trend === 'up' ? (
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-1 text-red-500" />
                )}
                {kpi.change} from last period
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights Banner */}
      {showAIInsights && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-800">
              <Brain className="w-5 h-5 mr-2" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                <span className="text-sm">
                  Your conversion rate could improve by 15% with better onboarding
                </span>
              </div>
              <div className="flex items-center">
                <Rocket className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-sm">
                  Peak traffic hours: 2-4 PM EST. Consider scaling resources
                </span>
              </div>
              <div className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-red-600" />
                <span className="text-sm">
                  Unusual error spike detected. Investigate payment gateway
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard */}
      <Tabs value={selectedMetric} onValueChange={setSelectedMetric} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="cohorts">Cohorts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Core Web Vitals over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData.slice(-7)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="lcp" stroke="#8884d8" name="LCP (ms)" />
                    <Line type="monotone" dataKey="fcp" stroke="#82ca9d" name="FCP (ms)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Engagement */}
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Page engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={userBehaviorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" fill="#8884d8" name="Users" />
                    <Bar dataKey="engagement" fill="#82ca9d" name="Engagement %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Conversion Funnel */}
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
              <CardDescription>User journey through conversion steps</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {conversionData.map((step, index) => (
                  <div key={step.step} className="flex items-center space-x-4">
                    <div className="w-24 text-sm font-medium">{step.step}</div>
                    <div className="flex-1">
                      <Progress value={step.rate} className="h-3" />
                    </div>
                    <div className="w-20 text-sm text-gray-600 text-right">
                      {step.users.toLocaleString()} ({step.rate}%)
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>Performance metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="lcp" stroke="#8884d8" name="LCP" />
                    <Line type="monotone" dataKey="fcp" stroke="#82ca9d" name="FCP" />
                    <Line type="monotone" dataKey="inp" stroke="#ffc658" name="INP" />
                    <Line type="monotone" dataKey="ttfb" stroke="#ff7c7c" name="TTFB" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
                <CardDescription>Current performance scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={[
                    { metric: 'LCP', score: 85, fullMark: 100 },
                    { metric: 'FCP', score: 92, fullMark: 100 },
                    { metric: 'CLS', score: 78, fullMark: 100 },
                    { metric: 'INP', score: 88, fullMark: 100 },
                    { metric: 'TTFB', score: 82, fullMark: 100 },
                    { metric: 'Overall', score: 85, fullMark: 100 },
                  ]}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Performance Metrics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Metric</th>
                      <th className="text-left p-2">Current</th>
                      <th className="text-left p-2">Target</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { metric: 'LCP', current: '1.2s', target: '<2.5s', status: 'good', trend: 'improving' },
                      { metric: 'FCP', current: '0.8s', target: '<1.8s', status: 'good', trend: 'stable' },
                      { metric: 'CLS', current: '0.05', target: '<0.1', status: 'good', trend: 'improving' },
                      { metric: 'INP', current: '95ms', target: '<200ms', status: 'good', trend: 'stable' },
                      { metric: 'TTFB', current: '245ms', target: '<600ms', status: 'good', trend: 'degrading' },
                    ].map((row) => (
                      <tr key={row.metric} className="border-b">
                        <td className="p-2 font-medium">{row.metric}</td>
                        <td className="p-2">{row.current}</td>
                        <td className="p-2">{row.target}</td>
                        <td className="p-2">
                          <Badge variant={row.status === 'good' ? 'default' : 'destructive'}>
                            {row.status}
                          </Badge>
                        </td>
                        <td className="p-2">
                          <Badge variant="outline">{row.trend}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Behavior Heatmap</CardTitle>
                <CardDescription>Page engagement patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={userBehaviorData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" dataKey="users" name="Users" />
                    <YAxis type="number" dataKey="engagement" name="Engagement" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter data={userBehaviorData} fill="#8884d8" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Distribution</CardTitle>
                <CardDescription>User device breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Desktop', value: 45, fill: '#8884d8' },
                        { name: 'Mobile', value: 40, fill: '#82ca9d' },
                        { name: 'Tablet', value: 15, fill: '#ffc658' },
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label
                    >
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Financial performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" stackId="1" stroke="#8884d8" fill="#8884d8" />
                  <Area type="monotone" dataKey="profit" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Error Analysis</CardTitle>
              <CardDescription>Error patterns and severity</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={errorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ff7c7c" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohorts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cohort Retention Analysis</CardTitle>
              <CardDescription>User retention by cohort</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <div className="grid grid-cols-9 gap-1 text-xs">
                  <div className="p-2 font-medium">Cohort</div>
                  {Array.from({ length: 8 }, (_, i) => (
                    <div key={i} className="p-2 font-medium text-center">Week {i}</div>
                  ))}
                  {cohortData.map((cohort, index) => (
                    <React.Fragment key={index}>
                      <div className="p-2 font-medium">{cohort.cohort}</div>
                      {cohort.retention.map((rate: number | null, weekIndex: number) => (
                        <div
                          key={weekIndex}
                          className={`p-2 text-center ${
                            rate === null 
                              ? 'bg-gray-100' 
                              : rate > 50 
                                ? 'bg-green-100 text-green-800' 
                                : rate > 25 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {rate !== null ? `${rate.toFixed(0)}%` : '-'}
                        </div>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AnalyticsDashboard 