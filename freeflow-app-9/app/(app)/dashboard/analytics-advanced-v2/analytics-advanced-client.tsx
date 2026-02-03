'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  BarChart3, TrendingUp, TrendingDown, Users, DollarSign, Eye,
  MousePointer, Clock, Globe, Smartphone, Monitor, Tablet, RefreshCw,
  Download, Calendar, ArrowUpRight, ArrowDownRight, Target, Zap,
  PieChart, LineChart, Activity, Filter, Layers, GitBranch
} from 'lucide-react'

const kpiData = [
  { label: 'Revenue', value: '$142,580', change: 23.5, trend: 'up', target: 150000, current: 142580 },
  { label: 'Active Users', value: '12,847', change: 8.2, trend: 'up', target: 15000, current: 12847 },
  { label: 'Conversion Rate', value: '4.82%', change: -1.3, trend: 'down', target: 5.5, current: 4.82 },
  { label: 'Avg. Session', value: '4m 32s', change: 12.1, trend: 'up', target: 5, current: 4.53 },
]

const trafficSources = [
  { source: 'Organic Search', visitors: 4580, percentage: 35.7, change: 12.3 },
  { source: 'Direct', visitors: 3245, percentage: 25.3, change: 8.1 },
  { source: 'Social Media', visitors: 2890, percentage: 22.5, change: -3.2 },
  { source: 'Referral', visitors: 1456, percentage: 11.3, change: 15.8 },
  { source: 'Email', visitors: 676, percentage: 5.2, change: 22.1 },
]

const topPages = [
  { page: '/dashboard', views: 15420, uniqueViews: 8920, avgTime: '3:45', bounceRate: 28 },
  { page: '/projects', views: 12350, uniqueViews: 7120, avgTime: '4:12', bounceRate: 32 },
  { page: '/analytics', views: 9870, uniqueViews: 5430, avgTime: '5:23', bounceRate: 18 },
  { page: '/team', views: 7650, uniqueViews: 4560, avgTime: '2:56', bounceRate: 42 },
  { page: '/settings', views: 5420, uniqueViews: 3210, avgTime: '2:12', bounceRate: 55 },
]

const funnelData = [
  { stage: 'Website Visit', users: 10000, percentage: 100 },
  { stage: 'Sign Up Page', users: 6500, percentage: 65 },
  { stage: 'Account Created', users: 3250, percentage: 32.5 },
  { stage: 'First Action', users: 1950, percentage: 19.5 },
  { stage: 'Paid Conversion', users: 780, percentage: 7.8 },
]

const cohortData = [
  { week: 'Week 1', retention: [100, 45, 32, 28, 24, 22, 20] },
  { week: 'Week 2', retention: [100, 48, 35, 30, 26, 23] },
  { week: 'Week 3', retention: [100, 52, 38, 32, 28] },
  { week: 'Week 4', retention: [100, 50, 36, 30] },
]

export default function AnalyticsAdvancedClient() {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateRange, setDateRange] = useState('30d')

  const insights = [
    { icon: TrendingUp, title: '+23.5% Revenue', description: 'Month over month' },
    { icon: Users, title: '12,847 Active', description: 'Daily active users' },
    { icon: Target, title: '7.8% Conversion', description: 'Funnel completion rate' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Advanced Analytics
          </h1>
          <p className="text-muted-foreground mt-1">Deep insights into your business performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="Key Insights"
        insights={insights}
        defaultExpanded={true}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">{kpi.label}</p>
                <Badge variant="outline" className={
                  kpi.trend === 'up'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }>
                  {kpi.trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {Math.abs(kpi.change)}%
                </Badge>
              </div>
              <p className="text-2xl font-bold">{kpi.value}</p>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress to target</span>
                  <span>{Math.round((kpi.current / kpi.target) * 100)}%</span>
                </div>
                <Progress value={(kpi.current / kpi.target) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="cohort">Cohort</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Revenue Chart</p>
                    <p className="text-2xl font-bold mt-2">$142,580</p>
                    <p className="text-sm text-green-600">+23.5% vs last period</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Traffic Sources
                </CardTitle>
                <CardDescription>Where your visitors come from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trafficSources.map((source, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-24 text-sm font-medium truncate">{source.source}</div>
                      <div className="flex-1">
                        <Progress value={source.percentage} className="h-2" />
                      </div>
                      <div className="w-16 text-right text-sm">{source.percentage}%</div>
                      <Badge variant="outline" className={
                        source.change >= 0
                          ? 'bg-green-100 text-green-700 text-xs'
                          : 'bg-red-100 text-red-700 text-xs'
                      }>
                        {source.change > 0 ? '+' : ''}{source.change}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>How users access your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { icon: Monitor, device: 'Desktop', percentage: 58, sessions: 7456 },
                  { icon: Smartphone, device: 'Mobile', percentage: 35, sessions: 4497 },
                  { icon: Tablet, device: 'Tablet', percentage: 7, sessions: 894 },
                ].map((item, idx) => (
                  <div key={idx} className="p-6 border rounded-lg text-center">
                    <item.icon className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-3xl font-bold">{item.percentage}%</p>
                    <p className="font-medium">{item.device}</p>
                    <p className="text-sm text-muted-foreground">{item.sessions.toLocaleString()} sessions</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Pages</CardTitle>
              <CardDescription>Most visited pages on your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-5 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                  <div>Page</div>
                  <div className="text-right">Views</div>
                  <div className="text-right">Unique Views</div>
                  <div className="text-right">Avg. Time</div>
                  <div className="text-right">Bounce Rate</div>
                </div>
                {topPages.map((page, idx) => (
                  <div key={idx} className="grid grid-cols-5 gap-4 items-center py-2 border-b last:border-0">
                    <div className="font-medium text-sm truncate">{page.page}</div>
                    <div className="text-right">{page.views.toLocaleString()}</div>
                    <div className="text-right">{page.uniqueViews.toLocaleString()}</div>
                    <div className="text-right">{page.avgTime}</div>
                    <div className="text-right">
                      <Badge variant="outline" className={
                        page.bounceRate < 30 ? 'bg-green-100 text-green-700' :
                        page.bounceRate < 45 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }>
                        {page.bounceRate}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
              <CardDescription>User locations worldwide</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { country: 'United States', flag: '🇺🇸', users: 4520, percentage: 35 },
                  { country: 'United Kingdom', flag: '🇬🇧', users: 2340, percentage: 18 },
                  { country: 'Germany', flag: '🇩🇪', users: 1890, percentage: 15 },
                  { country: 'Canada', flag: '🇨🇦', users: 1456, percentage: 11 },
                  { country: 'Australia', flag: '🇦🇺', users: 1120, percentage: 9 },
                ].map((country, idx) => (
                  <div key={idx} className="p-4 border rounded-lg text-center">
                    <span className="text-3xl">{country.flag}</span>
                    <p className="font-medium mt-2">{country.country}</p>
                    <p className="text-2xl font-bold">{country.percentage}%</p>
                    <p className="text-sm text-muted-foreground">{country.users.toLocaleString()} users</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Conversion Funnel
              </CardTitle>
              <CardDescription>User journey from visit to conversion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {funnelData.map((stage, idx) => (
                  <div key={idx} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-medium">{stage.stage}</div>
                    <div className="flex-1">
                      <div
                        className="h-10 bg-primary/80 rounded-r-lg flex items-center px-3"
                        style={{ width: `${stage.percentage}%` }}
                      >
                        <span className="text-white font-medium">{stage.users.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="w-16 text-right font-semibold">{stage.percentage}%</div>
                    {idx > 0 && (
                      <Badge variant="outline" className="w-20 justify-center bg-red-100 text-red-700">
                        -{Math.round(funnelData[idx - 1].percentage - stage.percentage)}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Overall Conversion Rate</p>
                    <p className="text-sm text-muted-foreground">From first visit to paid conversion</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-green-600">7.8%</p>
                    <p className="text-sm text-muted-foreground">+1.2% vs last period</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cohort" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Cohort Retention
              </CardTitle>
              <CardDescription>User retention by signup week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left p-2 text-sm font-medium text-muted-foreground">Cohort</th>
                      {['Day 0', 'Day 7', 'Day 14', 'Day 21', 'Day 28', 'Day 35', 'Day 42'].map((day, i) => (
                        <th key={i} className="text-center p-2 text-sm font-medium text-muted-foreground">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cohortData.map((cohort, idx) => (
                      <tr key={idx}>
                        <td className="p-2 font-medium">{cohort.week}</td>
                        {cohort.retention.map((value, i) => (
                          <td key={i} className="p-2 text-center">
                            <div
                              className={`rounded p-2 ${
                                value >= 80 ? 'bg-green-100 text-green-700' :
                                value >= 50 ? 'bg-blue-100 text-blue-700' :
                                value >= 30 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}
                            >
                              {value}%
                            </div>
                          </td>
                        ))}
                        {Array(7 - cohort.retention.length).fill(null).map((_, i) => (
                          <td key={`empty-${i}`} className="p-2 text-center">
                            <div className="p-2 text-muted-foreground">-</div>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-green-100"></div>
                  <span>≥80%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-blue-100"></div>
                  <span>≥50%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-yellow-100"></div>
                  <span>≥30%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-red-100"></div>
                  <span>&lt;30%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
