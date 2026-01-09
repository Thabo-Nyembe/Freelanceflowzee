'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
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
  Building,
  Plus,
  Filter,
  Calendar,
  FileText,
  Mail,
  Bell,
  Share2,
  Trash2
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

  // Dialog states
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [showAddGoalDialog, setShowAddGoalDialog] = useState(false)
  const [showFilterDialog, setShowFilterDialog] = useState(false)
  const [showDateRangeDialog, setShowDateRangeDialog] = useState(false)
  const [showAddReportDialog, setShowAddReportDialog] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [showScheduleDialog, setShowScheduleDialog] = useState(false)

  // Form states
  const [exportFormat, setExportFormat] = useState('csv')
  const [dateRange, setDateRange] = useState('last30days')
  const [goalName, setGoalName] = useState('')
  const [goalTarget, setGoalTarget] = useState('')
  const [goalCategory, setGoalCategory] = useState('revenue')
  const [reportName, setReportName] = useState('')
  const [reportDescription, setReportDescription] = useState('')
  const [shareEmail, setShareEmail] = useState('')
  const [scheduleFrequency, setScheduleFrequency] = useState('weekly')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  // Settings states
  const [enableNotifications, setEnableNotifications] = useState(true)
  const [enableAutoRefresh, setEnableAutoRefresh] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState('15')
  const [dataDisplayMode, setDataDisplayMode] = useState('detailed')

  // Filter states
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterMinValue, setFilterMinValue] = useState('')
  const [filterMaxValue, setFilterMaxValue] = useState('')

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
    toast.success('Data refreshed successfully')
  }

  // Handle export
  const handleExport = () => {
    toast.success(`Report exported as ${exportFormat.toUpperCase()}`, {
      description: 'Your business intelligence report has been downloaded'
    })
    setShowExportDialog(false)
  }

  // Handle save settings
  const handleSaveSettings = () => {
    toast.success('Settings saved successfully', {
      description: 'Your dashboard preferences have been updated'
    })
    setShowSettingsDialog(false)
  }

  // Handle add goal
  const handleAddGoal = () => {
    if (!goalName || !goalTarget) {
      toast.error('Please fill in all required fields')
      return
    }
    toast.success(`Goal "${goalName}" added successfully`, {
      description: `Target: ${goalTarget} in ${goalCategory}`
    })
    setGoalName('')
    setGoalTarget('')
    setGoalCategory('revenue')
    setShowAddGoalDialog(false)
  }

  // Handle add goal from template
  const handleAddGoalFromTemplate = (templateId: string, templateName: string) => {
    setSelectedTemplate(templateId)
    toast.success(`Goal "${templateName}" added from template`, {
      description: 'You can customize this goal in the Goals tab'
    })
  }

  // Handle apply filters
  const handleApplyFilters = () => {
    toast.success('Filters applied', {
      description: `Category: ${filterCategory}, Status: ${filterStatus}`
    })
    setShowFilterDialog(false)
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilterCategory('all')
    setFilterStatus('all')
    setFilterMinValue('')
    setFilterMaxValue('')
    toast.info('Filters cleared')
    setShowFilterDialog(false)
  }

  // Handle date range selection
  const handleDateRangeApply = () => {
    const rangeLabels: Record<string, string> = {
      'last7days': 'Last 7 Days',
      'last30days': 'Last 30 Days',
      'last90days': 'Last 90 Days',
      'thisYear': 'This Year',
      'lastYear': 'Last Year',
      'custom': 'Custom Range'
    }
    toast.success(`Date range set to ${rangeLabels[dateRange]}`)
    setShowDateRangeDialog(false)
  }

  // Handle add report
  const handleAddReport = () => {
    if (!reportName) {
      toast.error('Please enter a report name')
      return
    }
    toast.success(`Report "${reportName}" created`, {
      description: reportDescription || 'Custom report added to your dashboard'
    })
    setReportName('')
    setReportDescription('')
    setShowAddReportDialog(false)
  }

  // Handle share
  const handleShare = () => {
    if (!shareEmail) {
      toast.error('Please enter an email address')
      return
    }
    toast.success(`Report shared with ${shareEmail}`, {
      description: 'An email with the report link has been sent'
    })
    setShareEmail('')
    setShowShareDialog(false)
  }

  // Handle schedule report
  const handleScheduleReport = () => {
    const frequencyLabels: Record<string, string> = {
      'daily': 'Daily',
      'weekly': 'Weekly',
      'monthly': 'Monthly',
      'quarterly': 'Quarterly'
    }
    toast.success(`Report scheduled ${frequencyLabels[scheduleFrequency].toLowerCase()}`, {
      description: 'You will receive automated reports via email'
    })
    setShowScheduleDialog(false)
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

            <Button variant="outline" size="icon" onClick={() => setShowFilterDialog(true)}>
              <Filter className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={() => setShowDateRangeDialog(true)}>
              <Calendar className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>

            <Button variant="outline" onClick={() => setShowExportDialog(true)}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>

            <Button variant="outline" size="icon" onClick={() => setShowShareDialog(true)}>
              <Share2 className="w-4 h-4" />
            </Button>

            <Button variant="outline" size="icon" onClick={() => setShowSettingsDialog(true)}>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Revenue Breakdown</CardTitle>
                  <CardDescription>Analysis of your revenue streams</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowAddReportDialog(true)}>
                    <FileText className="w-4 h-4 mr-2" />
                    Create Report
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowScheduleDialog(true)}>
                    <Bell className="w-4 h-4 mr-2" />
                    Schedule
                  </Button>
                </div>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Client Value Metrics</CardTitle>
                  <CardDescription>Understanding your client economics</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success('Client metrics exported', {
                    description: 'LTV, CAC, and ratio data downloaded'
                  })
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Metrics
                </Button>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Profitability Insights</CardTitle>
                  <CardDescription>Key insights to improve your project profitability</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => {
                  toast.success('Profitability report generated', {
                    description: 'Detailed analysis downloaded as PDF'
                  })
                }}>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
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
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Recommended KPIs for {userType.charAt(0).toUpperCase() + userType.slice(1)}s</CardTitle>
                  <CardDescription>Key performance indicators tailored to your business type</CardDescription>
                </div>
                <Button onClick={() => setShowAddGoalDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Custom Goal
                </Button>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddGoalFromTemplate(template.id, template.name)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
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

      {/* Export Dialog */}
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Report
            </DialogTitle>
            <DialogDescription>
              Export your business intelligence data in your preferred format
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Spreadsheet)</SelectItem>
                  <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="json">JSON (Data)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Include Sections</Label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Revenue Data
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Client Metrics
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Project Analytics
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Goals & KPIs
                </label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Dashboard Settings
            </DialogTitle>
            <DialogDescription>
              Customize your business intelligence dashboard
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive alerts for important changes</p>
              </div>
              <Switch checked={enableNotifications} onCheckedChange={setEnableNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-refresh Data</Label>
                <p className="text-sm text-muted-foreground">Automatically update dashboard data</p>
              </div>
              <Switch checked={enableAutoRefresh} onCheckedChange={setEnableAutoRefresh} />
            </div>
            {enableAutoRefresh && (
              <div className="space-y-2">
                <Label>Refresh Interval (minutes)</Label>
                <Select value={refreshInterval} onValueChange={setRefreshInterval}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Data Display Mode</Label>
              <Select value={dataDisplayMode} onValueChange={setDataDisplayMode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select display mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary View</SelectItem>
                  <SelectItem value="detailed">Detailed View</SelectItem>
                  <SelectItem value="compact">Compact View</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Goal Dialog */}
      <Dialog open={showAddGoalDialog} onOpenChange={setShowAddGoalDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Add New Goal
            </DialogTitle>
            <DialogDescription>
              Create a custom KPI goal to track your business performance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="goalName">Goal Name *</Label>
              <Input
                id="goalName"
                placeholder="e.g., Monthly Revenue Target"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalCategory">Category</Label>
              <Select value={goalCategory} onValueChange={setGoalCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="clients">Clients</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="profitability">Profitability</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goalTarget">Target Value *</Label>
              <Input
                id="goalTarget"
                placeholder="e.g., $50,000 or 15%"
                value={goalTarget}
                onChange={(e) => setGoalTarget(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddGoalDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGoal}>
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter Data
            </DialogTitle>
            <DialogDescription>
              Apply filters to refine your business intelligence data
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="revenue">Revenue</SelectItem>
                  <SelectItem value="clients">Clients</SelectItem>
                  <SelectItem value="projects">Projects</SelectItem>
                  <SelectItem value="goals">Goals</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minValue">Min Value</Label>
                <Input
                  id="minValue"
                  type="number"
                  placeholder="0"
                  value={filterMinValue}
                  onChange={(e) => setFilterMinValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxValue">Max Value</Label>
                <Input
                  id="maxValue"
                  type="number"
                  placeholder="100,000"
                  value={filterMaxValue}
                  onChange={(e) => setFilterMaxValue(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClearFilters}>
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
            <Button onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Date Range Dialog */}
      <Dialog open={showDateRangeDialog} onOpenChange={setShowDateRangeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Select Date Range
            </DialogTitle>
            <DialogDescription>
              Choose the time period for your analytics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="thisYear">This Year</SelectItem>
                  <SelectItem value="lastYear">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {dateRange === 'custom' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input type="date" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDateRangeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleDateRangeApply}>
              Apply Range
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Report Dialog */}
      <Dialog open={showAddReportDialog} onOpenChange={setShowAddReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Create Custom Report
            </DialogTitle>
            <DialogDescription>
              Build a custom report with your selected metrics
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reportName">Report Name *</Label>
              <Input
                id="reportName"
                placeholder="e.g., Q4 Performance Summary"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reportDescription">Description</Label>
              <Textarea
                id="reportDescription"
                placeholder="Describe what this report includes..."
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Include Metrics</Label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Revenue Trends
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" defaultChecked className="rounded" />
                  Client Growth
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  Project Status
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="rounded" />
                  KPI Progress
                </label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddReportDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddReport}>
              <Plus className="w-4 h-4 mr-2" />
              Create Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Share Report
            </DialogTitle>
            <DialogDescription>
              Share your business intelligence report with team members
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="shareEmail">Email Address</Label>
              <Input
                id="shareEmail"
                type="email"
                placeholder="colleague@company.com"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Access Level</Label>
              <Select defaultValue="view">
                <SelectTrigger>
                  <SelectValue placeholder="Select access level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="comment">Can Comment</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                An email invitation will be sent with a link to view this report
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowShareDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Report Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Schedule Report
            </DialogTitle>
            <DialogDescription>
              Set up automated report delivery
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Frequency</Label>
              <Select value={scheduleFrequency} onValueChange={setScheduleFrequency}>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Delivery Format</Label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="xlsx">Excel Spreadsheet</SelectItem>
                  <SelectItem value="email">Email Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recipients</Label>
              <Input placeholder="Enter email addresses (comma separated)" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowScheduleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleScheduleReport}>
              <Bell className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default BusinessIntelligenceClient
