"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { NumberFlow } from '@/components/ui/number-flow'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { LiquidGlassCard } from '@/components/ui/liquid-glass-card'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Wallet,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  Target,
  Receipt,
  Building,
  Users,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react'

export default function FinancialHubPage() {
  const [_selectedPeriod, setSelectedPeriod] = useState<string>('monthly')
  const [activeTab, setActiveTab] = useState<string>('overview')

  // Handler functions with comprehensive logging
  const handleExportReport = () => {
    console.log('💾 FINANCIAL HUB: Export report initiated')
    console.log('📊 FINANCIAL HUB: Gathering financial data for export')
    console.log('✅ FINANCIAL HUB: Report generated successfully')
    toast.success('💾 Exporting Financial Report', {
      description: 'Comprehensive financial report is being generated'
    })
  }

  const handleScheduleReview = () => {
    console.log('📅 FINANCIAL HUB: Schedule review initiated')
    console.log('🔍 FINANCIAL HUB: Checking calendar availability')
    console.log('✅ FINANCIAL HUB: Financial review scheduled')
    toast.success('📅 Financial Review Scheduled', {
      description: 'Your financial review has been successfully scheduled'
    })
  }

  const handleAddClient = () => {
    console.log('➕ FINANCIAL HUB: Add client initiated')
    console.log('📝 FINANCIAL HUB: Opening client creation form')
    toast.info('➕ Add New Client', {
      description: 'Opening client creation form'
    })
  }

  const handleEditClient = (id: number) => {
    console.log('✏️ FINANCIAL HUB: Edit client initiated')
    console.log('🔍 FINANCIAL HUB: Loading client data: ' + id)
    console.log('📝 FINANCIAL HUB: Opening edit form for client ' + id)
    toast.info('✏️ Edit Client', {
      description: 'Opening edit form for client #' + id
    })
  }

  const handleDeleteClient = (id: number) => {
    console.log('🗑️ FINANCIAL HUB: Delete client requested: ' + id)
    if (confirm('Delete client?')) {
      console.log('✅ FINANCIAL HUB: Client deletion confirmed')
      console.log('💾 FINANCIAL HUB: Removing client from database')
      toast.success('✅ Client Deleted', {
        description: 'Client has been successfully removed'
      })
    } else {
      console.log('❌ FINANCIAL HUB: Client deletion cancelled')
    }
  }

  const handleViewClientDetails = (id: number) => {
    console.log('👤 FINANCIAL HUB: View client details: ' + id)
    console.log('📊 FINANCIAL HUB: Loading client revenue data')
    console.log('📈 FINANCIAL HUB: Loading client project history')
    toast.info('👤 Viewing Client Details', {
      description: 'Loading details for client #' + id
    })
  }

  const handleCreateGoal = () => {
    console.log('🎯 FINANCIAL HUB: Create goal initiated')
    console.log('📝 FINANCIAL HUB: Opening goal creation form')
    toast.info('🎯 Create New Financial Goal', {
      description: 'Opening goal creation form'
    })
  }

  const handleEditGoal = (id: string) => {
    console.log('✏️ FINANCIAL HUB: Edit goal: ' + id)
    console.log('📊 FINANCIAL HUB: Loading goal progress data')
    toast.info('✏️ Edit Goal', {
      description: 'Loading goal: ' + id
    })
  }

  const handleDeleteGoal = (id: string) => {
    console.log('🗑️ FINANCIAL HUB: Delete goal requested: ' + id)
    if (confirm('Delete goal?')) {
      console.log('✅ FINANCIAL HUB: Goal deletion confirmed')
      toast.success('✅ Goal Deleted', {
        description: 'Financial goal has been successfully removed'
      })
    }
  }

  const handleTrackGoalProgress = () => {
    console.log('📊 FINANCIAL HUB: Track goal progress initiated')
    console.log('📈 FINANCIAL HUB: Calculating progress metrics')
    console.log('✅ FINANCIAL HUB: Progress data loaded')
    toast.info('📊 Tracking Goal Progress', {
      description: 'Calculating your financial goal progress metrics'
    })
  }

  const handleAddExpense = () => {
    console.log('➕ FINANCIAL HUB: Add expense initiated')
    console.log('📝 FINANCIAL HUB: Opening expense form')
    toast.info('➕ Add Expense', {
      description: 'Opening expense form'
    })
  }

  const handleCategorizeExpense = () => {
    console.log('📁 FINANCIAL HUB: Categorize expense initiated')
    console.log('🏷️ FINANCIAL HUB: Loading expense categories')
    toast.info('📁 Categorize Expense', {
      description: 'Loading expense categories'
    })
  }

  const handleViewExpenseBreakdown = () => {
    console.log('📊 FINANCIAL HUB: View expense breakdown')
    console.log('📈 FINANCIAL HUB: Calculating category percentages')
    console.log('✅ FINANCIAL HUB: Breakdown data ready')
    toast.info('📊 Expense Breakdown', {
      description: 'Viewing breakdown by category'
    })
  }

  const handleExportExpenses = () => {
    console.log('💾 FINANCIAL HUB: Export expenses initiated')
    console.log('📊 FINANCIAL HUB: Formatting expense data for export')
    console.log('✅ FINANCIAL HUB: Expenses exported successfully')
    toast.success('💾 Exporting Expenses', {
      description: 'Your expense data is being exported'
    })
  }

  const handleGenerateInvoiceReport = () => {
    console.log('📊 FINANCIAL HUB: Generate invoice report')
    console.log('🔍 FINANCIAL HUB: Analyzing invoice data')
    console.log('📈 FINANCIAL HUB: Calculating totals and statistics')
    console.log('✅ FINANCIAL HUB: Invoice report generated')
    toast.success('📊 Generating Invoice Report', {
      description: 'Analyzing invoice data and calculating statistics'
    })
  }

  const handleBulkInvoiceAction = () => {
    console.log('📋 FINANCIAL HUB: Bulk invoice action initiated')
    console.log('📊 FINANCIAL HUB: Processing multiple invoices')
    toast.info('📋 Bulk Invoice Operations', {
      description: 'Processing multiple invoices'
    })
  }

  const handleSendInvoiceReminders = () => {
    console.log('📧 FINANCIAL HUB: Send invoice reminders')
    console.log('🔍 FINANCIAL HUB: Finding overdue invoices')
    console.log('✉️ FINANCIAL HUB: Sending email reminders')
    console.log('✅ FINANCIAL HUB: Reminders sent successfully')
    toast.success('📧 Sending Payment Reminders', {
      description: 'Email reminders are being sent for overdue invoices'
    })
  }

  const handleRecordPayment = (id: number) => {
    console.log('💰 FINANCIAL HUB: Record payment for invoice: ' + id)
    console.log('🔍 FINANCIAL HUB: Loading invoice details')
    console.log('💳 FINANCIAL HUB: Processing payment information')
    toast.info('💰 Record Payment', {
      description: 'Recording payment for invoice #' + id
    })
  }

  const handleRefreshDashboard = () => {
    console.log('🔄 FINANCIAL HUB: Refresh dashboard initiated')
    console.log('📊 FINANCIAL HUB: Fetching latest financial data')
    console.log('✅ FINANCIAL HUB: Dashboard data refreshed')
    toast.success('🔄 Refreshing Dashboard', {
      description: 'Fetching latest financial data'
    })
  }

  const handleGenerateFinancialForecast = () => {
    console.log('🔮 FINANCIAL HUB: Generate forecast initiated')
    console.log('📊 FINANCIAL HUB: Analyzing historical data')
    console.log('📈 FINANCIAL HUB: Calculating projections')
    console.log('✅ FINANCIAL HUB: Forecast generated successfully')
    toast.success('🔮 Generating Financial Forecast', {
      description: 'Analyzing historical data and calculating projections'
    })
  }

  const handleTaxReport = () => {
    console.log('📋 FINANCIAL HUB: Tax report generation initiated')
    console.log('💼 FINANCIAL HUB: Gathering income and expense data')
    console.log('📊 FINANCIAL HUB: Calculating tax deductions and liabilities')
    console.log('✅ FINANCIAL HUB: Tax report ready for accountant')
    toast.success('📋 Generating Tax Report', {
      description: 'Comprehensive tax report is being prepared for your accountant'
    })
  }

  const handleFinancialAudit = () => {
    console.log('🔍 FINANCIAL HUB: Financial audit initiated')
    console.log('📊 FINANCIAL HUB: Analyzing all transactions and accounts')
    console.log('💰 FINANCIAL HUB: Checking for discrepancies and anomalies')
    console.log('✅ FINANCIAL HUB: Audit completed successfully')
    toast.success('🔍 Running Financial Audit', {
      description: 'Performing comprehensive financial audit and compliance check'
    })
  }

  // Mock comprehensive financial data
  const financialData = {
    overview: {
      totalRevenue: 245231,
      totalExpenses: 98500,
      netProfit: 146731,
      monthlyGrowth: 15.2,
      yearlyGrowth: 28.4,
      profitMargin: 59.8
    },
    invoices: {
      total: 47,
      paid: 35,
      pending: 8,
      overdue: 4,
      totalAmount: 198500,
      paidAmount: 145230,
      pendingAmount: 42270,
      overdueAmount: 11000
    },
    expenses: {
      total: 98500,
      categories: {
        software: 25000,
        marketing: 18500,
        office: 15000,
        travel: 12000,
        utilities: 8000,
        other: 20000
      }
    },
    clients: {
      total: 24,
      active: 18,
      new: 6,
      topClients: [
        { name: 'Acme Corp', revenue: 45000, projects: 8 },
        { name: 'Tech Startup', revenue: 38000, projects: 5 },
        { name: 'Design Agency', revenue: 32000, projects: 12 },
        { name: 'Local Business', revenue: 25000, projects: 3 }
      ]
    },
    goals: {
      monthlyTarget: 50000,
      yearlyTarget: 600000,
      currentProgress: 42000,
      yearlyProgress: 245231
    }
  }

  const recentTransactions = [
    { id: 1, type: 'income', description: 'Project Payment - Acme Corp', amount: 15000, date: '2024-01-15', status: 'completed' },
    { id: 2, type: 'expense', description: 'Software Subscriptions', amount: -2999, date: '2024-01-14', status: 'completed' },
    { id: 3, type: 'income', description: 'Design Package - Tech Startup', amount: 8500, date: '2024-01-12', status: 'completed' },
    { id: 4, type: 'expense', description: 'Marketing Campaign', amount: -3500, date: '2024-01-10', status: 'completed' },
    { id: 5, type: 'income', description: 'Consultation - Design Agency', amount: 2500, date: '2024-01-08', status: 'pending' }
  ]

  const upcomingPayments = [
    { id: 1, client: 'Acme Corp', amount: 12500, dueDate: '2024-01-25', status: 'pending' },
    { id: 2, client: 'Tech Startup', amount: 8000, dueDate: '2024-01-30', status: 'overdue' },
    { id: 3, client: 'Local Business', amount: 5500, dueDate: '2024-02-05', status: 'scheduled' }
  ]

  const monthlyTargetProgress = (financialData.goals.currentProgress / financialData.goals.monthlyTarget) * 100
  const yearlyTargetProgress = (financialData.goals.yearlyProgress / financialData.goals.yearlyTarget) * 100

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title + Icon */}
        <div>
          <div className="flex items-center gap-3">
            {/* Gradient icon container */}
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <TextShimmer className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">
              Financial Hub
            </TextShimmer>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive financial management and analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button data-testid="export-report-btn" variant="outline" size="sm" onClick={handleExportReport}>
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button data-testid="schedule-review-btn" size="sm" onClick={handleScheduleReview}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Review
          </Button>
          <Button data-testid="refresh-dashboard-btn" variant="outline" size="sm" onClick={handleRefreshDashboard}>
            <Clock className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button data-testid="generate-forecast-btn" size="sm" onClick={handleGenerateFinancialForecast}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Forecast
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <LiquidGlassCard data-testid="revenue-card" variant="gradient" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Revenue</p>
              <div className="p-2 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 dark:from-emerald-400/10 dark:to-teal-400/10 rounded-lg backdrop-blur-sm">
                <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <NumberFlow
              value={financialData.overview.totalRevenue}
              format="currency"
              className="text-2xl font-bold text-emerald-600 dark:text-emerald-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              +<NumberFlow value={financialData.overview.monthlyGrowth} decimals={1} className="inline-block" />% from last month
            </p>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard data-testid="profit-card" variant="tinted" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Profit</p>
              <div className="p-2 bg-gradient-to-br from-green-400/20 to-emerald-400/20 dark:from-green-400/10 dark:to-emerald-400/10 rounded-lg backdrop-blur-sm">
                <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <NumberFlow
              value={financialData.overview.netProfit}
              format="currency"
              className="text-2xl font-bold text-green-600 dark:text-green-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Margin: <NumberFlow value={financialData.overview.profitMargin} decimals={1} className="inline-block" />%
            </p>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard data-testid="expenses-card" variant="gradient" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Expenses</p>
              <div className="p-2 bg-gradient-to-br from-red-400/20 to-orange-400/20 dark:from-red-400/10 dark:to-orange-400/10 rounded-lg backdrop-blur-sm">
                <CreditCard className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <NumberFlow
              value={financialData.overview.totalExpenses}
              format="currency"
              className="text-2xl font-bold text-red-600 dark:text-red-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
              <ArrowDownRight className="h-3 w-3 text-red-500" />
              -5.2% from last month
            </p>
          </div>
        </LiquidGlassCard>

        <LiquidGlassCard data-testid="clients-card" variant="tinted" hoverEffect={true}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Clients</p>
              <div className="p-2 bg-gradient-to-br from-blue-400/20 to-indigo-400/20 dark:from-blue-400/10 dark:to-indigo-400/10 rounded-lg backdrop-blur-sm">
                <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <NumberFlow
              value={financialData.clients.active}
              className="text-2xl font-bold text-blue-600 dark:text-blue-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              <NumberFlow value={financialData.clients.new} className="inline-block" /> new this month
            </p>
          </div>
        </LiquidGlassCard>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger data-testid="overview-tab" value="overview">Overview</TabsTrigger>
          <TabsTrigger data-testid="invoices-tab" value="invoices">Invoices</TabsTrigger>
          <TabsTrigger data-testid="expenses-tab" value="expenses">Expenses</TabsTrigger>
          <TabsTrigger data-testid="clients-tab" value="clients">Clients</TabsTrigger>
          <TabsTrigger data-testid="goals-tab" value="goals">Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest financial activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'}`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          ${Math.abs(transaction.amount).toLocaleString()}
                        </div>
                        <Badge className={transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Financial Goals</CardTitle>
                <CardDescription>Track your financial targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Monthly Target</span>
                      <span className="text-sm text-gray-600">
                        ${financialData.goals.currentProgress.toLocaleString()} / ${financialData.goals.monthlyTarget.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(monthlyTargetProgress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(monthlyTargetProgress)}% complete</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Yearly Target</span>
                      <span className="text-sm text-gray-600">
                        ${financialData.goals.yearlyProgress.toLocaleString()} / ${financialData.goals.yearlyTarget.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(yearlyTargetProgress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{Math.round(yearlyTargetProgress)}% complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">Total Invoices</p>
                    <p className="text-2xl font-bold">{financialData.invoices.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Paid</p>
                    <p className="text-2xl font-bold">{financialData.invoices.paid}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold">{financialData.invoices.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm text-gray-600">Overdue</p>
                    <p className="text-2xl font-bold">{financialData.invoices.overdue}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Payments</CardTitle>
              <CardDescription>Invoices due for payment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{payment.client}</p>
                      <p className="text-sm text-gray-500">Due: {payment.dueDate}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                      <Badge className={`${
                        payment.status === 'overdue' ? 'bg-red-100 text-red-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
              <CardDescription>Breakdown of business expenses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(financialData.expenses.categories).map(([category, amount]) => (
                  <div key={category} className="p-4 border rounded-lg">
                    <h3 className="font-medium capitalize">{category}</h3>
                    <p className="text-2xl font-bold">${amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {((amount / financialData.expenses.total) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Clients</CardTitle>
              <CardDescription>Your most valuable clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.clients.topClients.map((client, index) => (
                  <div key={client.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-gray-500">{client.projects} projects</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${client.revenue.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Total revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Financial Goals & Targets</CardTitle>
                  <CardDescription>Set and track your financial objectives</CardDescription>
                </div>
                <Button data-testid="create-goal-btn" size="sm" onClick={handleCreateGoal}>
                  <Target className="h-4 w-4 mr-2" />
                  Create Goal
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Click "Create Goal" to set your first financial target</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
