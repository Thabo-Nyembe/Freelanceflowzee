'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Lightbulb,
  Crown,
  Building2,
  User,
  Building,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  PiggyBank,
  Zap
} from 'lucide-react'

// Import hooks
import { useBusinessIntelligence } from '@/hooks/use-business-intelligence'
import { useProfitability } from '@/hooks/use-profitability'
import { useClientValue } from '@/hooks/use-client-value'
import { useRevenueForecast } from '@/hooks/use-revenue-forecast'
import { useKPIGoals } from '@/hooks/use-kpi-goals'

type UserType = 'freelancer' | 'entrepreneur' | 'agency' | 'enterprise'

export default function BusinessIntelligencePage() {
  const [userType, setUserType] = useState<UserType>('freelancer')
  const [refreshing, setRefreshing] = useState(false)

  // Load all hooks
  const {
    metrics,
    healthScore,
    loading: biLoading,
    refresh: refreshBI
  } = useBusinessIntelligence({ useMockData: true })

  const {
    summary: profitSummary,
    projectProfitability,
    clientProfitability,
    loading: profitLoading
  } = useProfitability({ useMockData: true })

  const {
    clientMetrics,
    churnAnalysis,
    ltvAnalysis,
    loading: clientLoading
  } = useClientValue({ useMockData: true })

  const {
    scenarios,
    forecasts,
    goals: revenueGoals,
    loading: forecastLoading
  } = useRevenueForecast({ useMockData: true })

  const {
    goals: kpiGoals,
    dashboard: kpiDashboard,
    insights,
    templates,
    getTemplatesForUserType,
    loading: kpiLoading
  } = useKPIGoals({ useMockData: true })

  const loading = biLoading || profitLoading || clientLoading || forecastLoading || kpiLoading

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true)
    await refreshBI()
    setTimeout(() => setRefreshing(false), 1000)
  }

  // Get user type specific templates
  const userTemplates = getTemplatesForUserType(userType)

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Calculate overall health
  const overallHealth = healthScore ? {
    score: healthScore.overallScore,
    status: healthScore.overallScore >= 80 ? 'Excellent' :
            healthScore.overallScore >= 60 ? 'Good' :
            healthScore.overallScore >= 40 ? 'Fair' : 'Needs Attention'
  } : { score: 0, status: 'Loading...' }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:bg-none dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/3" />
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:bg-none dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Crown className="w-8 h-8 text-yellow-500" />
              Business Intelligence
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Maximize your business with AI-powered analytics and insights
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* User Type Selector */}
            <Select value={userType} onValueChange={(v) => setUserType(v as UserType)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="freelancer">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Freelancer
                  </div>
                </SelectItem>
                <SelectItem value="entrepreneur">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" />
                    Entrepreneur
                  </div>
                </SelectItem>
                <SelectItem value="agency">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Agency
                  </div>
                </SelectItem>
                <SelectItem value="enterprise">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Enterprise
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>

            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Business Health Score */}
        <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white dark:bg-none dark:bg-indigo-900">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-3xl font-bold">{overallHealth.score}</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {overallHealth.score >= 60 ? (
                      <CheckCircle className="w-6 h-6 text-green-300" />
                    ) : (
                      <AlertTriangle className="w-6 h-6 text-yellow-300" />
                    )}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Business Health Score</h2>
                  <p className="text-white/80">
                    Your business is in <span className="font-semibold">{overallHealth.status}</span> condition
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {healthScore?.components.slice(0, 3).map((component, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="bg-white/20 text-white hover:bg-white/30"
                  >
                    {component.name}: {component.score}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">{formatCurrency(metrics?.totalRevenue || 0)}</p>
                  <div className={`flex items-center text-sm ${(metrics?.revenueGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(metrics?.revenueGrowth || 0) >= 0 ? (
                      <TrendingUp className="w-4 h-4 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 mr-1" />
                    )}
                    {(metrics?.revenueGrowth || 0) >= 0 ? '+' : ''}{metrics?.revenueGrowth?.toFixed(1) || 0}%
                  </div>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profit Margin */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Net Profit Margin</p>
                  <p className="text-2xl font-bold">{metrics?.netMargin?.toFixed(1) || 0}%</p>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Target className="w-4 h-4 mr-1" />
                    Target: 35%
                  </div>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <PiggyBank className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Clients */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Clients</p>
                  <p className="text-2xl font-bold">{clientMetrics?.activeClients || 0}</p>
                  <div className="flex items-center text-sm text-green-600">
                    <ArrowUpRight className="w-4 h-4 mr-1" />
                    {clientMetrics?.newClientsThisMonth || 0} new this month
                  </div>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LTV:CAC Ratio */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">LTV:CAC Ratio</p>
                  <p className="text-2xl font-bold">{ltvAnalysis?.ltvToCacRatio?.toFixed(1) || 0}:1</p>
                  <div className={`flex items-center text-sm ${(ltvAnalysis?.ltvToCacRatio || 0) >= 3 ? 'text-green-600' : 'text-yellow-600'}`}>
                    {(ltvAnalysis?.ltvToCacRatio || 0) >= 3 ? (
                      <CheckCircle className="w-4 h-4 mr-1" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-1" />
                    )}
                    {(ltvAnalysis?.ltvToCacRatio || 0) >= 3 ? 'Healthy' : 'Below target'}
                  </div>
                </div>
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Health Components */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Health Score Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {healthScore?.components.map((component, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{component.name}</span>
                          <span className={
                            component.score >= 80 ? 'text-green-600' :
                            component.score >= 60 ? 'text-blue-600' :
                            component.score >= 40 ? 'text-yellow-600' : 'text-red-600'
                          }>
                            {component.score}/100
                          </span>
                        </div>
                        <Progress value={component.score} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Insights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {insights?.slice(0, 4).map((insight, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          insight.impact === 'positive' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' :
                          insight.impact === 'negative' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                          'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                        }`}
                      >
                        <p className="font-medium text-sm">{insight.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alerts */}
            {healthScore?.alerts && healthScore.alerts.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Alerts & Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {healthScore.alerts.slice(0, 6).map((alert, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-lg border ${
                          alert.severity === 'critical' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                          alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/20' :
                          'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {alert.severity === 'critical' ? (
                            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                          ) : alert.severity === 'warning' ? (
                            <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <Zap className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="text-sm font-medium">{alert.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios?.map((scenario) => (
                <Card key={scenario.id} className={`border-2 ${
                  scenario.type === 'optimistic' ? 'border-green-200 dark:border-green-800' :
                  scenario.type === 'pessimistic' ? 'border-red-200 dark:border-red-800' :
                  'border-blue-200 dark:border-blue-800'
                }`}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      {scenario.type === 'optimistic' && <ArrowUpRight className="w-5 h-5 text-green-500" />}
                      {scenario.type === 'realistic' && <TrendingUp className="w-5 h-5 text-blue-500" />}
                      {scenario.type === 'pessimistic' && <ArrowDownRight className="w-5 h-5 text-red-500" />}
                      <span className="capitalize">{scenario.type}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-2">
                      {formatCurrency(scenario.projectedRevenue)}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className={(scenario.growthRate ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {(scenario.growthRate ?? 0) >= 0 ? '+' : ''}{(scenario.growthRate ?? 0).toFixed(1)}%
                      </span>
                      <span className="text-muted-foreground">
                        {((scenario.confidence ?? 0.7) * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-xl font-bold">{formatCurrency(metrics?.totalRevenue || 0)}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Recurring</p>
                    <p className="text-xl font-bold">{formatCurrency(metrics?.recurringRevenue || 0)}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Project</p>
                    <p className="text-xl font-bold">{formatCurrency(metrics?.projectRevenue || 0)}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Growth</p>
                    <p className={`text-xl font-bold ${(metrics?.revenueGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(metrics?.revenueGrowth || 0) >= 0 ? '+' : ''}{metrics?.revenueGrowth?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Total Clients</p>
                  <p className="text-2xl font-bold">{clientMetrics?.totalClients || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Activity className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{clientMetrics?.activeClients || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-sm text-muted-foreground">Retention</p>
                  <p className="text-2xl font-bold">{clientMetrics?.retentionRate?.toFixed(1) || 0}%</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                  <p className="text-sm text-muted-foreground">At Risk</p>
                  <p className="text-2xl font-bold text-red-600">{churnAnalysis?.atRiskCount || 0}</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Top Clients by Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {clientProfitability?.slice(0, 5).map((client, idx) => (
                    <div key={client.clientId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">{client.clientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {client.projectCount} projects
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(client.totalProfit)}</p>
                        <p className="text-sm text-muted-foreground">{client.profitMargin.toFixed(1)}% margin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-indigo-500" />
                  <p className="text-sm text-muted-foreground">Total Goals</p>
                  <p className="text-2xl font-bold">{kpiDashboard?.totalGoals || 0}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm text-muted-foreground">On Track</p>
                  <p className="text-2xl font-bold text-green-600">
                    {kpiGoals?.filter(g => g.status === 'on_track').length || 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-sm text-muted-foreground">At Risk</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {kpiDashboard?.atRiskGoals || 0}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">{kpiDashboard?.overallProgress || 0}%</p>
                </CardContent>
              </Card>
            </div>

            {/* Goal Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kpiGoals?.map((goal) => (
                <Card key={goal.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold">{goal.name}</h3>
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                      </div>
                      <Badge
                        variant={
                          goal.status === 'on_track' || goal.status === 'achieved' ? 'default' :
                          goal.status === 'at_risk' ? 'secondary' : 'destructive'
                        }
                      >
                        {goal.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>
                          {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.unit}
                        </span>
                        <span className="font-medium">
                          {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={(goal.currentValue / goal.targetValue) * 100}
                        className="h-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* KPI Templates */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended KPIs for {userType.charAt(0).toUpperCase() + userType.slice(1)}s</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {userTemplates.slice(0, 6).map((template) => (
                    <div key={template.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-sm">{template.name}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {template.category}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Target: {template.defaultTarget}{template.unit}
                        </span>
                        <Button size="sm" variant="ghost">
                          Add
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
