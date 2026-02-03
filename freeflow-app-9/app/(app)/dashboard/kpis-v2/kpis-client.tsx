'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CollapsibleInsightsPanel } from '@/components/ui/collapsible-insights-panel'
import {
  Gauge, TrendingUp, TrendingDown, Search, Plus, AlertCircle,
  CheckCircle, BarChart3, LineChart, PieChart, Activity,
  DollarSign, Users, ShoppingCart, Target, Clock, Calendar,
  ArrowUp, ArrowDown, Minus, RefreshCw, Download, Settings
} from 'lucide-react'

const kpis = [
  {
    id: 1,
    name: 'Monthly Recurring Revenue',
    category: 'financial',
    value: 87500,
    previousValue: 82000,
    target: 100000,
    unit: '$',
    format: 'currency',
    trend: 'up',
    change: 6.7,
    status: 'on-track',
    frequency: 'monthly',
    owner: 'Finance Team',
    lastUpdated: '2024-01-15'
  },
  {
    id: 2,
    name: 'Customer Acquisition Cost',
    category: 'financial',
    value: 145,
    previousValue: 165,
    target: 120,
    unit: '$',
    format: 'currency',
    trend: 'down',
    change: -12.1,
    status: 'improving',
    frequency: 'monthly',
    owner: 'Marketing',
    lastUpdated: '2024-01-15'
  },
  {
    id: 3,
    name: 'Net Promoter Score',
    category: 'customer',
    value: 58,
    previousValue: 52,
    target: 70,
    unit: '',
    format: 'number',
    trend: 'up',
    change: 11.5,
    status: 'on-track',
    frequency: 'quarterly',
    owner: 'Customer Success',
    lastUpdated: '2024-01-10'
  },
  {
    id: 4,
    name: 'Customer Churn Rate',
    category: 'customer',
    value: 2.8,
    previousValue: 3.2,
    target: 2.0,
    unit: '%',
    format: 'percentage',
    trend: 'down',
    change: -12.5,
    status: 'at-risk',
    frequency: 'monthly',
    owner: 'Customer Success',
    lastUpdated: '2024-01-15'
  },
  {
    id: 5,
    name: 'Average Order Value',
    category: 'sales',
    value: 285,
    previousValue: 260,
    target: 300,
    unit: '$',
    format: 'currency',
    trend: 'up',
    change: 9.6,
    status: 'on-track',
    frequency: 'weekly',
    owner: 'Sales',
    lastUpdated: '2024-01-15'
  },
  {
    id: 6,
    name: 'Conversion Rate',
    category: 'marketing',
    value: 3.2,
    previousValue: 2.9,
    target: 4.0,
    unit: '%',
    format: 'percentage',
    trend: 'up',
    change: 10.3,
    status: 'on-track',
    frequency: 'weekly',
    owner: 'Marketing',
    lastUpdated: '2024-01-15'
  },
  {
    id: 7,
    name: 'Employee Satisfaction',
    category: 'operations',
    value: 78,
    previousValue: 75,
    target: 85,
    unit: '%',
    format: 'percentage',
    trend: 'up',
    change: 4.0,
    status: 'on-track',
    frequency: 'quarterly',
    owner: 'HR',
    lastUpdated: '2024-01-05'
  },
  {
    id: 8,
    name: 'Support Response Time',
    category: 'operations',
    value: 4.2,
    previousValue: 5.8,
    target: 3.0,
    unit: 'hrs',
    format: 'time',
    trend: 'down',
    change: -27.6,
    status: 'improving',
    frequency: 'daily',
    owner: 'Support',
    lastUpdated: '2024-01-15'
  },
]

const categories = [
  { id: 'all', name: 'All KPIs', icon: Gauge },
  { id: 'financial', name: 'Financial', icon: DollarSign },
  { id: 'customer', name: 'Customer', icon: Users },
  { id: 'sales', name: 'Sales', icon: ShoppingCart },
  { id: 'marketing', name: 'Marketing', icon: Target },
  { id: 'operations', name: 'Operations', icon: Activity },
]

export default function KpisClient() {
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [timeRange, setTimeRange] = useState('month')

  const stats = useMemo(() => ({
    totalKpis: kpis.length,
    onTrack: kpis.filter(k => k.status === 'on-track').length,
    improving: kpis.filter(k => k.status === 'improving').length,
    atRisk: kpis.filter(k => k.status === 'at-risk').length,
  }), [])

  const filteredKpis = useMemo(() => {
    return kpis.filter(kpi => {
      const matchesSearch = kpi.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = activeTab === 'all' || kpi.category === activeTab
      return matchesSearch && matchesTab
    })
  }, [searchQuery, activeTab])

  const formatValue = (kpi: typeof kpis[0]) => {
    switch (kpi.format) {
      case 'currency':
        return `${kpi.unit}${kpi.value.toLocaleString()}`
      case 'percentage':
        return `${kpi.value}${kpi.unit}`
      case 'time':
        return `${kpi.value} ${kpi.unit}`
      default:
        return kpi.value.toString()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track': return 'text-green-600'
      case 'improving': return 'text-blue-600'
      case 'at-risk': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up') {
      return <ArrowUp className={`h-4 w-4 ${change > 0 ? 'text-green-600' : 'text-red-600'}`} />
    } else if (trend === 'down') {
      return <ArrowDown className={`h-4 w-4 ${change < 0 ? 'text-green-600' : 'text-red-600'}`} />
    }
    return <Minus className="h-4 w-4 text-gray-600" />
  }

  const insights = [
    { icon: Gauge, title: `${stats.totalKpis}`, description: 'Total KPIs' },
    { icon: CheckCircle, title: `${stats.onTrack}`, description: 'On Track' },
    { icon: TrendingUp, title: `${stats.improving}`, description: 'Improving' },
  ]

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Gauge className="h-8 w-8 text-primary" />
            Key Performance Indicators
          </h1>
          <p className="text-muted-foreground mt-1">Monitor and track your business metrics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add KPI
          </Button>
        </div>
      </div>

      <CollapsibleInsightsPanel
        title="KPI Summary"
        insights={insights}
        defaultExpanded={true}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total KPIs</p>
                <p className="text-2xl font-bold">{stats.totalKpis}</p>
                <p className="text-xs text-muted-foreground mt-1">Being tracked</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Gauge className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">On Track</p>
                <p className="text-2xl font-bold">{stats.onTrack}</p>
                <p className="text-xs text-green-600 mt-1">{Math.round((stats.onTrack / stats.totalKpis) * 100)}% of KPIs</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Improving</p>
                <p className="text-2xl font-bold">{stats.improving}</p>
                <p className="text-xs text-blue-600 mt-1">Trending positive</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold">{stats.atRisk}</p>
                <p className="text-xs text-red-600 mt-1">Needs attention</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList>
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="flex items-center gap-1">
                <cat.icon className="h-4 w-4" />
                {cat.name}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search KPIs..."
                className="pl-9 w-48"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Time range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredKpis.map((kpi) => (
              <Card key={kpi.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm text-muted-foreground">{kpi.name}</p>
                      <p className="text-2xl font-bold mt-1">{formatValue(kpi)}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(kpi.status)}>
                      {kpi.status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Target: {kpi.unit === '$' ? `$${kpi.target.toLocaleString()}` : `${kpi.target}${kpi.unit}`}</span>
                      <div className="flex items-center gap-1">
                        {getTrendIcon(kpi.trend, kpi.change)}
                        <span className={kpi.change > 0 ? 'text-green-600' : 'text-red-600'}>
                          {kpi.change > 0 ? '+' : ''}{kpi.change}%
                        </span>
                      </div>
                    </div>
                    <Progress value={(kpi.value / kpi.target) * 100} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {kpi.owner}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {kpi.frequency}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
