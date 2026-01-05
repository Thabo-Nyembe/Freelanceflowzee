'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Target,
  PieChart,
  Activity,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Settings,
  RefreshCw,
  Lightbulb,
  Crown,
  Building2,
  User,
  Building
} from 'lucide-react'

// Import Business Health Dashboard component
import { BusinessHealthDashboard } from '@/components/business/business-health-dashboard'

// Import hooks
import { useBusinessIntelligence } from '@/hooks/use-business-intelligence'
import { useProfitability } from '@/hooks/use-profitability'
import { useClientValue } from '@/hooks/use-client-value'
import { useRevenueForecast } from '@/hooks/use-revenue-forecast'
import { useKPIGoals } from '@/hooks/use-kpi-goals'

type UserType = 'freelancer' | 'entrepreneur' | 'agency' | 'enterprise'

export function BusinessIntelligenceClient() {
  const [userType, setUserType] = useState<UserType>('freelancer')
  const [refreshing, setRefreshing] = useState(false)

  // Load all hooks - using real data
  const {
    metrics,
    healthScore,
    isLoading: biLoading,
    refresh: refreshBI
  } = useBusinessIntelligence({ businessType: userType })

  const {
    summary: profitSummary,
    loading: profitLoading
  } = useProfitability({})

  const {
    clientMetrics,
    loading: clientLoading
  } = useClientValue({})

  const {
    scenarios,
    loading: forecastLoading
  } = useRevenueForecast({})

  const {
    dashboard: kpiDashboard,
    templates,
    getTemplatesForUserType,
    loading: kpiLoading
  } = useKPIGoals({})

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

  // User type icons
  const userTypeIcons: Record<UserType, React.ReactNode> = {
    freelancer: <User className="w-4 h-4" />,
    entrepreneur: <Lightbulb className="w-4 h-4" />,
    agency: <Building className="w-4 h-4" />,
    enterprise: <Building2 className="w-4 h-4" />
  }

  // User type descriptions
  const userTypeDescriptions: Record<UserType, string> = {
    freelancer: 'Individual professional optimizing personal productivity and client relationships',
    entrepreneur: 'Business owner focused on growth, scalability, and market expansion',
    agency: 'Team-based organization managing multiple clients and projects',
    enterprise: 'Large organization with complex operations and multiple departments'
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
              Export Report
            </Button>

            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* User Type Banner */}
        <Card className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white dark:bg-none dark:bg-indigo-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                {userTypeIcons[userType]}
              </div>
              <div>
                <h3 className="font-semibold capitalize">{userType} Mode</h3>
                <p className="text-sm text-white/80">{userTypeDescriptions[userType]}</p>
              </div>
              <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                {userTemplates.length} KPI Templates Available
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="revenue" className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Revenue</span>
            </TabsTrigger>
            <TabsTrigger value="clients" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Clients</span>
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Projects</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <BusinessHealthDashboard
              userType={userType}
              showFullDashboard={true}
            />
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
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
                    <CardDescription>{scenario.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold mb-2">
                      {formatCurrency(scenario.projectedRevenue)}
                    </p>
                    <div className="flex items-center justify-between text-sm">
                      <span className={(scenario.growthRate ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {(scenario.growthRate ?? 0) >= 0 ? '+' : ''}{(scenario.growthRate ?? 0).toFixed(1)}% growth
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
                <CardDescription>Analysis of your revenue streams</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics?.totalRevenue || 0)}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Recurring Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics?.recurringRevenue || 0)}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Project Revenue</p>
                    <p className="text-2xl font-bold">{formatCurrency(metrics?.projectRevenue || 0)}</p>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Revenue Growth</p>
                    <p className={`text-2xl font-bold ${(metrics?.revenueGrowth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {(metrics?.revenueGrowth || 0) >= 0 ? '+' : ''}{metrics?.revenueGrowth?.toFixed(1) || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Clients Tab */}
          <TabsContent value="clients" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Clients</p>
                      <p className="text-2xl font-bold">{clientMetrics?.totalClients || 0}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Clients</p>
                      <p className="text-2xl font-bold text-green-600">{clientMetrics?.activeClients || 0}</p>
                    </div>
                    <Activity className="w-8 h-8 text-green-500" />
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
                    <TrendingUp className="w-8 h-8 text-purple-500" />
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
                    <DollarSign className="w-8 h-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Client Value Metrics</CardTitle>
                <CardDescription>Understanding your client economics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-medium">LTV Analysis</h4>
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Average Client Lifetime Value</p>
                      <p className="text-3xl font-bold text-green-600">{formatCurrency(metrics?.clientLifetimeValue || 0)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Based on average revenue per client over their lifetime
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Acquisition Cost</h4>
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Customer Acquisition Cost (CAC)</p>
                      <p className="text-3xl font-bold text-blue-600">{formatCurrency(metrics?.clientAcquisitionCost || 0)}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Average cost to acquire a new client
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">LTV:CAC Ratio</h4>
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                      <p className="text-sm text-muted-foreground">Lifetime Value to CAC Ratio</p>
                      <p className="text-3xl font-bold text-purple-600">{metrics?.ltvToCacRatio?.toFixed(1) || 0}:1</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(metrics?.ltvToCacRatio || 0) >= 3 ? 'Healthy ratio (target: 3:1+)' : 'Below target (aim for 3:1+)'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Projects</p>
                      <p className="text-2xl font-bold">{profitSummary?.projectCount || 0}</p>
                    </div>
                    <Briefcase className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Revenue</p>
                      <p className="text-2xl font-bold">{formatCurrency(profitSummary?.totalRevenue || 0)}</p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Profit</p>
                      <p className="text-2xl font-bold text-green-600">{formatCurrency(profitSummary?.totalProfit || 0)}</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-emerald-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Margin</p>
                      <p className="text-2xl font-bold">{profitSummary?.overallMargin?.toFixed(1) || 0}%</p>
                    </div>
                    <PieChart className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Profitability Insights</CardTitle>
                <CardDescription>Key insights to improve your project profitability</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-medium text-green-800 dark:text-green-200">High Performers</h4>
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                      Your projects with 35%+ margins are generating the most value. Focus on replicating what works in these engagements.
                    </p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Optimization Opportunity</h4>
                    <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
                      Projects with 15-25% margins could benefit from better scope management and time tracking.
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-medium text-blue-800 dark:text-blue-200">Pricing Strategy</h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                      Consider value-based pricing for complex projects to improve margins and better align with client outcomes.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
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
                        {kpiDashboard?.activeGoals || 0}
                      </p>
                    </div>
                    <BarChart3 className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Achieved</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {kpiDashboard?.achievedGoals || 0}
                      </p>
                    </div>
                    <Activity className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Progress</p>
                      <p className="text-2xl font-bold">{kpiDashboard?.overallProgress || 0}%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* KPI Templates for User Type */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended KPIs for {userType.charAt(0).toUpperCase() + userType.slice(1)}s</CardTitle>
                <CardDescription>Key performance indicators tailored to your business type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userTemplates.slice(0, 6).map((template) => (
                    <div key={template.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{template.name}</h4>
                        <Badge variant="outline" className="capitalize">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">
                          Target: <span className="font-medium">{template.defaultTarget}{template.unit}</span>
                        </span>
                        <Button size="sm" variant="outline">
                          Add Goal
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground py-4">
          <p>Business Intelligence Dashboard | Helping {userType}s maximize their potential</p>
        </div>
      </div>
    </div>
  )
}

export default BusinessIntelligenceClient
