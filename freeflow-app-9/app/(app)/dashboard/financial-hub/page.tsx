"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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

  // Handler functions
  const handleExportReport = () => { console.log('💾 EXPORT'); alert('💾 Exporting comprehensive financial report...') }
  const handleScheduleReview = () => { console.log('📅 SCHEDULE'); alert('📅 Financial review scheduled') }
  const handleAddClient = () => { console.log('➕ ADD CLIENT'); alert('➕ Add new client') }
  const handleEditClient = (id: number) => { console.log('✏️ EDIT CLIENT:', id); alert(`✏️ Edit client #${id}`) }
  const handleDeleteClient = (id: number) => { console.log('🗑️ DELETE CLIENT:', id); confirm('Delete client?') && alert('✅ Client deleted') }
  const handleViewClientDetails = (id: number) => { console.log('👤 VIEW CLIENT:', id); alert(`👤 Viewing client #${id} details`) }
  const handleCreateGoal = () => { console.log('🎯 CREATE GOAL'); alert('🎯 Create new financial goal') }
  const handleEditGoal = (id: string) => { console.log('✏️ EDIT GOAL:', id); alert(`✏️ Edit goal: ${id}`) }
  const handleDeleteGoal = (id: string) => { console.log('🗑️ DELETE GOAL:', id); confirm('Delete goal?') && alert('✅ Goal deleted') }
  const handleTrackGoalProgress = () => { console.log('📊 TRACK PROGRESS'); alert('📊 Tracking goal progress...') }
  const handleAddExpense = () => { console.log('➕ ADD EXPENSE'); alert('➕ Add expense') }
  const handleCategorizeExpense = () => { console.log('📁 CATEGORIZE'); alert('📁 Categorize expense') }
  const handleViewExpenseBreakdown = () => { console.log('📊 BREAKDOWN'); alert('📊 Expense breakdown by category') }
  const handleExportExpenses = () => { console.log('💾 EXPORT EXPENSES'); alert('💾 Exporting expenses...') }
  const handleGenerateInvoiceReport = () => { console.log('📊 INVOICE REPORT'); alert('📊 Generating invoice report') }
  const handleBulkInvoiceAction = () => { console.log('📋 BULK ACTION'); alert('📋 Bulk invoice operations') }
  const handleSendInvoiceReminders = () => { console.log('📧 REMINDERS'); alert('📧 Sending payment reminders') }
  const handleRecordPayment = (id: number) => { console.log('💰 PAYMENT:', id); alert(`💰 Record payment for invoice #${id}`) }
  const handleRefreshDashboard = () => { console.log('🔄 REFRESH'); alert('🔄 Refreshing dashboard data...') }
  const handleGenerateFinancialForecast = () => { console.log('🔮 FORECAST'); alert('🔮 Generating financial forecast') }

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
            <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">
              Financial Hub
            </h1>
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
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card data-testid="revenue-card" className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 kazi-text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold kazi-text-accent">${financialData.overview.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              +{financialData.overview.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="profit-card" className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${financialData.overview.netProfit.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Margin: {financialData.overview.profitMargin}%</p>
          </CardContent>
        </Card>

        <Card data-testid="expenses-card" className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${financialData.overview.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-red-500" />
              -5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card data-testid="clients-card" className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <Users className="h-4 w-4 kazi-text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold kazi-text-primary">{financialData.clients.active}</div>
            <p className="text-xs text-gray-500">{financialData.clients.new} new this month</p>
          </CardContent>
        </Card>
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
              <CardTitle>Financial Goals & Targets</CardTitle>
              <CardDescription>Set and track your financial objectives</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Goal tracking and management coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
