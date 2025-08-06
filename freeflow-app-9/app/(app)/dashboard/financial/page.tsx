"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  Wallet, 
  PieChart,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight 
} from 'lucide-react'

export default function FinancialPage() {
  const [_selectedPeriod, setSelectedPeriod] = useState<any>('monthly')

  // Mock financial data
  const financialData = {
    totalRevenue: 45231,
    totalExpenses: 18500,
    netProfit: 26731,
    monthlyGrowth: 12.5,
    pendingInvoices: 5,
    overdueInvoices: 2,
    recentTransactions: [
      { id: 1, type: 'income', description: 'Project Payment - Acme Corp', amount: 5000, date: '2024-01-15' },
      { id: 2, type: 'expense', description: 'Software Subscriptions', amount: -299, date: '2024-01-14' },
      { id: 3, type: 'income', description: 'Design Package - Tech Startup', amount: 3500, date: '2024-01-12' },
      { id: 4, type: 'expense', description: 'Marketing Campaign', amount: -1500, date: '2024-01-10' }
    ],
    upcomingPayments: [
      { id: 1, client: 'Acme Corp', amount: 2500, dueDate: '2024-01-20', status: 'pending' },
      { id: 2, client: 'Tech Startup', amount: 5000, dueDate: '2024-01-25', status: 'overdue' }
    ]
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">Financial Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">Track your business finances and performance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Review
          </Button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 kazi-text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold kazi-text-accent">${financialData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <ArrowUpRight className="h-3 w-3 text-green-500" />
              +{financialData.monthlyGrowth}% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">${financialData.totalExpenses.toLocaleString()}</div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <ArrowDownRight className="h-3 w-3 text-red-500" />
              -5.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${financialData.netProfit.toLocaleString()}</div>
            <p className="text-xs text-gray-500">Profit margin: 59.1%</p>
          </CardContent>
        </Card>

        <Card className="kazi-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 kazi-text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold kazi-text-primary">{financialData.pendingInvoices}</div>
            <p className="text-xs text-gray-500">{financialData.overdueInvoices} overdue</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Financial Analysis */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest income and expenses</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialData.recentTransactions.map((transaction) => (
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
                      <div className={`font-semibold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        ${Math.abs(transaction.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Invoices due for payment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {financialData.upcomingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.client}</p>
                        <p className="text-sm text-gray-500">Due: {payment.dueDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${payment.amount.toLocaleString()}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'overdue' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Complete transaction history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialData.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg kazi-bg-secondary">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 dark:bg-green-900/20' 
                          : 'bg-red-100 dark:bg-red-900/20'
                      }`}>
                        {transaction.type === 'income' ? (
                          <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium kazi-text-primary">{transaction.description}</p>
                        <p className="text-sm kazi-text-tertiary">{transaction.date}</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${
                      transaction.type === 'income' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                    </span>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  View All Transactions
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
              <CardDescription>Create and manage invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium kazi-text-primary">Upcoming Payments</h3>
                    <p className="text-sm kazi-text-tertiary">Invoices awaiting payment</p>
                  </div>
                  <Button size="sm">Create Invoice</Button>
                </div>
                
                <div className="space-y-3">
                  {financialData.upcomingPayments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg kazi-border">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 kazi-text-secondary" />
                        <div>
                          <p className="font-medium kazi-text-primary">{payment.client}</p>
                          <p className="text-sm kazi-text-tertiary">Due: {payment.dueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold kazi-text-primary">
                          ${payment.amount.toLocaleString()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          payment.status === 'overdue' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" className="w-full">
                  View All Invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financial Reports</CardTitle>
              <CardDescription>Generate detailed financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="kazi-card p-4">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
                      <div>
                        <p className="text-sm kazi-text-tertiary">Monthly Growth</p>
                        <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                          +{financialData.monthlyGrowth}%
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="kazi-card p-4">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-sm kazi-text-tertiary">Pending Invoices</p>
                        <p className="text-lg font-semibold kazi-text-primary">
                          {financialData.pendingInvoices}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="kazi-card p-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-8 w-8 text-red-600 dark:text-red-400" />
                      <div>
                        <p className="text-sm kazi-text-tertiary">Overdue</p>
                        <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                          {financialData.overdueInvoices}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-medium kazi-text-primary">Quick Reports</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <div className="flex items-center space-x-3">
                        <PieChart className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Profit & Loss</p>
                          <p className="text-sm kazi-text-tertiary">Monthly P&L statement</p>
                        </div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Cash Flow</p>
                          <p className="text-sm kazi-text-tertiary">Income vs expenses</p>
                        </div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Tax Summary</p>
                          <p className="text-sm kazi-text-tertiary">Quarterly tax overview</p>
                        </div>
                      </div>
                    </Button>
                    
                    <Button variant="outline" className="justify-start h-auto p-4">
                      <div className="flex items-center space-x-3">
                        <Wallet className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Expense Report</p>
                          <p className="text-sm kazi-text-tertiary">Detailed expenses</p>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
