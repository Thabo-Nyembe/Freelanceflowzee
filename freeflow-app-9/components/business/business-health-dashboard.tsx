'use client'

import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  DollarSign,
  Users,
  Target,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  Clock,
  PiggyBank,
  Zap,
  Award,
  AlertCircle,
  ChevronRight,
  BarChart3,
  LineChart,
  PieChart
} from 'lucide-react'

import { useBusinessIntelligence } from '@/hooks/use-business-intelligence'
import { useProfitability } from '@/hooks/use-profitability'
import { useClientValue } from '@/hooks/use-client-value'
import { useRevenueForecast } from '@/hooks/use-revenue-forecast'
import { useKPIGoals } from '@/hooks/use-kpi-goals'

interface BusinessHealthDashboardProps {
  userType?: 'freelancer' | 'entrepreneur' | 'agency' | 'enterprise'
  showFullDashboard?: boolean
  useMockData?: boolean
  className?: string
}

export function BusinessHealthDashboard({
  userType = 'freelancer',
  showFullDashboard = true,
  useMockData = true,
  className = ''
}: BusinessHealthDashboardProps) {
  // Load all business intelligence hooks
  const {
    metrics,
    healthScore,
    goals: biGoals,
    forecasts,
    benchmarks,
    loading: biLoading
  } = useBusinessIntelligence({ useMockData })

  const {
    projectProfitability,
    clientProfitability,
    profitTrends,
    loading: profitLoading
  } = useProfitability({ useMockData })

  const {
    clientMetrics,
    churnAnalysis,
    ltvAnalysis,
    loading: clientLoading
  } = useClientValue({ useMockData })

  const {
    forecasts: revenueForecasts,
    scenarios,
    goals: revenueGoals,
    loading: forecastLoading
  } = useRevenueForecast({ useMockData })

  const {
    goals: kpiGoals,
    dashboard: kpiDashboard,
    insights,
    loading: kpiLoading
  } = useKPIGoals({ useMockData })

  const loading = biLoading || profitLoading || clientLoading || forecastLoading || kpiLoading

  // Calculate overall business health
  const overallHealth = useMemo(() => {
    if (!healthScore) return { score: 0, status: 'unknown', color: 'gray' }

    const score = healthScore.overallScore
    let status: string
    let color: string

    if (score >= 80) {
      status = 'Excellent'
      color = 'green'
    } else if (score >= 60) {
      status = 'Good'
      color = 'blue'
    } else if (score >= 40) {
      status = 'Fair'
      color = 'yellow'
    } else {
      status = 'Needs Attention'
      color = 'red'
    }

    return { score, status, color }
  }, [healthScore])

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  // Format percentage
  const formatPercent = (value: number | undefined | null) => {
    const val = value ?? 0
    return `${val >= 0 ? '+' : ''}${val.toFixed(1)}%`
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Business Health Score Header */}
      <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white dark:bg-none dark:bg-gray-800">
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
                  {formatPercent(metrics?.revenueGrowth || 0)} this month
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
                <p className="text-2xl font-bold">{(metrics?.netMargin ?? 0).toFixed(1)}%</p>
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
                <p className="text-2xl font-bold">{clientMetrics?.totalClients || 0}</p>
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
                  {(ltvAnalysis?.ltvToCacRatio || 0) >= 3 ? 'Healthy ratio' : 'Below target (3:1)'}
                </div>
              </div>
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Activity className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showFullDashboard && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
            <TabsTrigger value="forecast">Forecast</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Health Components */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    Health Score Breakdown
                  </CardTitle>
                  <CardDescription>Key components of your business health</CardDescription>
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
                        <p className="text-xs text-muted-foreground">{component.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Alerts & Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Alerts & Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {healthScore?.alerts.slice(0, 4).map((alert, idx) => (
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
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium">{alert.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  AI-Powered Insights
                </CardTitle>
                <CardDescription>Intelligent recommendations to maximize your business</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {insights?.slice(0, 3).map((insight, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border ${
                        insight.impact === 'positive' ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' :
                        insight.impact === 'negative' ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' :
                        'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {insight.type === 'trend' && <TrendingUp className="w-4 h-4" />}
                        {insight.type === 'anomaly' && <AlertTriangle className="w-4 h-4" />}
                        {insight.type === 'celebration' && <Award className="w-4 h-4" />}
                        {insight.type === 'prediction' && <LineChart className="w-4 h-4" />}
                        <span className="font-medium text-sm">{insight.title}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      {insight.suggestedAction && (
                        <Button variant="link" className="p-0 h-auto mt-2 text-xs">
                          {insight.suggestedAction} <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Goals</p>
                      <p className="text-2xl font-bold">{kpiDashboard?.totalGoals || 0}</p>
                    </div>
                    <Target className="w-8 h-8 text-indigo-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">On Track</p>
                      <p className="text-2xl font-bold text-green-600">
                        {kpiGoals?.filter(g => g.status === 'on_track').length || 0}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">At Risk</p>
                      <p className="text-2xl font-bold text-yellow-600">
                        {kpiDashboard?.atRiskGoals || 0}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Overall Progress</p>
                      <p className="text-2xl font-bold">{kpiDashboard?.overallProgress || 0}%</p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-blue-500" />
                  </div>
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
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Due: {new Date(goal.endDate).toLocaleDateString()}</span>
                        <span className="capitalize">{goal.priority} priority</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Client LTV</p>
                      <p className="text-2xl font-bold">{formatCurrency(ltvAnalysis?.averageLTV || 0)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Retention Rate</p>
                      <p className="text-2xl font-bold">{clientMetrics?.retentionRate?.toFixed(1) || 0}%</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Churn Risk</p>
                      <p className="text-2xl font-bold text-red-600">{churnAnalysis?.atRiskCount || 0}</p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Project Value</p>
                      <p className="text-2xl font-bold">{formatCurrency(clientMetrics?.averageProjectValue || 0)}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Clients */}
            <Card>
              <CardHeader>
                <CardTitle>Top Clients by Profitability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {clientProfitability?.slice(0, 5).map((client, idx) => (
                    <div key={client.clientId} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium">{client.clientName}</p>
                          <p className="text-sm text-muted-foreground">
                            {client.projectCount} projects | {client.totalHours} hours
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(client.totalProfit)}</p>
                        <p className="text-sm text-muted-foreground">{(client.profitMargin ?? 0).toFixed(1)}% margin</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profitability Tab */}
          <TabsContent value="profitability" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Gross Profit</p>
                      <p className="text-2xl font-bold">{formatCurrency(metrics?.grossProfit || 0)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Gross Margin</p>
                      <p className="text-2xl font-bold">{metrics?.grossMargin?.toFixed(1) || 0}%</p>
                    </div>
                    <PieChart className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Utilization Rate</p>
                      <p className="text-2xl font-bold">{metrics?.utilizationRate?.toFixed(1) || 0}%</p>
                    </div>
                    <Clock className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Project Profit</p>
                      <p className="text-2xl font-bold">
                        {formatCurrency(
                          projectProfitability?.reduce((sum, p) => sum + p.profit, 0) /
                          (projectProfitability?.length || 1) || 0
                        )}
                      </p>
                    </div>
                    <Briefcase className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Project Profitability */}
            <Card>
              <CardHeader>
                <CardTitle>Project Profitability Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectProfitability?.slice(0, 5).map((project) => (
                    <div key={project.projectId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium">{project.projectName}</h4>
                          <p className="text-sm text-muted-foreground">{project.clientName}</p>
                        </div>
                        <Badge variant={(project.profitMargin ?? 0) >= 30 ? 'default' : (project.profitMargin ?? 0) >= 15 ? 'secondary' : 'destructive'}>
                          {(project.profitMargin ?? 0).toFixed(1)}% margin
                        </Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Revenue</p>
                          <p className="font-medium">{formatCurrency(project.revenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Costs</p>
                          <p className="font-medium">{formatCurrency(project.totalCosts)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Profit</p>
                          <p className="font-medium text-green-600">{formatCurrency(project.profit)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Effective Rate</p>
                          <p className="font-medium">{formatCurrency(project.effectiveHourlyRate)}/hr</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecast Tab */}
          <TabsContent value="forecast" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {scenarios?.map((scenario) => (
                <Card key={scenario.id} className={
                  scenario.type === 'optimistic' ? 'border-green-200 dark:border-green-800' :
                  scenario.type === 'pessimistic' ? 'border-red-200 dark:border-red-800' :
                  'border-blue-200 dark:border-blue-800'
                }>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg capitalize">{scenario.type} Scenario</CardTitle>
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-2">
                      {formatCurrency(scenario.projectedRevenue)}
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Growth Rate</span>
                        <span className={scenario.growthRate >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatPercent(scenario.growthRate)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Confidence</span>
                        <span>{((scenario.confidence ?? 0.7) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Revenue Goals Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueGoals?.map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{goal.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                          </p>
                        </div>
                        <Badge variant={goal.status === 'on_track' ? 'default' : goal.status === 'achieved' ? 'default' : 'destructive'}>
                          {goal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Cash Flow Projection */}
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Cash on Hand</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics?.cashOnHand || 0)}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Monthly Burn Rate</p>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(metrics?.burnRate || 0)}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Cash Runway</p>
                    <p className="text-2xl font-bold">{metrics?.cashRunway?.toFixed(1) || 0} months</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

export default BusinessHealthDashboard
