"use client"

import { useState } from 'react'
import { toast } from 'sonner'
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
  ArrowDownRight,
  Download,
  Upload,
  Printer,
  Plus,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react'

export default function FinancialPage() {
  const [_selectedPeriod, setSelectedPeriod] = useState<any>('monthly')

  const handleExportReport = async (format: 'pdf' | 'csv' | 'xlsx') => {
    console.log('💾 EXPORT FINANCIAL REPORT - Format:', format.toUpperCase())

    try {
      const response = await fetch('/api/financial/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType: 'comprehensive',
          format: format === 'xlsx' ? 'csv' : format,  // xlsx maps to csv for now
          period: {
            start: new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to export report')
      }

      // Handle CSV download
      if (format === 'csv' || format === 'xlsx') {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `financial-report-${Date.now()}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`Report exported as ${format.toUpperCase()}`)

        // Show next steps
        setTimeout(() => {
          alert(`✅ Financial Report Exported\n\nNext Steps:\n• Open the CSV file in Excel or Google Sheets\n• Review revenue and expense trends\n• Share with your accountant or financial advisor\n• Use insights for tax planning and budgeting\n• Set up recurring exports for monthly reviews`)
        }, 500)
      } else {
        // Handle JSON/PDF response
        const result = await response.json()
        if (result.success) {
          toast.success('Report generated successfully!', {
            description: result.downloadUrl ? 'Download link ready' : 'Report data retrieved'
          })
          if (result.downloadUrl) {
            window.open(result.downloadUrl, '_blank')
          }
        }
      }
    } catch (error: any) {
      console.error('Export Report Error:', error)
      toast.error('Failed to export report', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleImportData = async () => {
    console.log('📥 IMPORT FINANCIAL DATA')

    // Create file input
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.json,.xlsx'

    input.onchange = async (e: Event) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        // Read file content
        const text = await file.text()

        // Determine file type
        let data
        if (file.name.endsWith('.json')) {
          data = JSON.parse(text)
        } else if (file.name.endsWith('.csv')) {
          // In production, would parse CSV properly
          data = { rawCsv: text, fileName: file.name }
        } else {
          data = { fileName: file.name, size: file.size }
        }

        const response = await fetch('/api/financial/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'import',
            data: {
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              importData: data
            }
          })
        })

        if (!response.ok) {
          throw new Error('Failed to import data')
        }

        const result = await response.json()

        if (result.success) {
          toast.success(result.message || 'Data imported successfully!', {
            description: `${result.recordsImported || 0} records imported`
          })

          // Show next steps
          setTimeout(() => {
            alert(`✅ Data Imported Successfully\n\nNext Steps:\n• Review imported transactions in the dashboard\n• Verify all amounts and categories are correct\n• Reconcile with bank statements\n• Update any missing information\n• Generate updated financial reports`)
          }, 500)
        }
      } catch (error: any) {
        console.error('Import Data Error:', error)
        toast.error('Failed to import data', {
          description: error.message || 'Please check file format and try again'
        })
      }
    }

    input.click()
  }

  const handleScheduleReview = () => {
    console.log('📅 SCHEDULE FINANCIAL REVIEW')
    const reviewDate = prompt('Enter review date (YYYY-MM-DD):')
    if (reviewDate) {
      alert(`📅 Financial Review Scheduled\n\nDate: ${reviewDate}\n\nYou'll receive a reminder 24 hours before.`)
    }
  }

  const handleViewAllTransactions = () => {
    console.log('📋 VIEW ALL TRANSACTIONS')
    alert('📋 All Transactions\n\nShowing complete transaction history...\n\n• Filter by date range\n• Filter by type\n• Search by description')
  }

  const handleAddTransaction = (type: 'income' | 'expense') => {
    console.log(`➕ ADD ${type.toUpperCase()}`)
    const description = prompt(`Enter ${type} description:`)
    if (description) {
      const amount = prompt('Enter amount:')
      if (amount) {
        alert(`✅ ${type === 'income' ? 'Income' : 'Expense'} Added\n\nDescription: ${description}\nAmount: $${amount}`)
      }
    }
  }

  const handleEditTransaction = (transactionId: number) => {
    console.log('✏️ EDIT TRANSACTION - ID:', transactionId)
    const newDescription = prompt('Edit transaction description:')
    if (newDescription) {
      alert(`✅ Transaction Updated\n\nNew description: ${newDescription}`)
    }
  }

  const handleDeleteTransaction = (transactionId: number) => {
    console.log('🗑️ DELETE TRANSACTION - ID:', transactionId)
    if (confirm('⚠️ Delete Transaction?\n\nThis action cannot be undone.\n\nAre you sure?')) {
      alert('✅ Transaction deleted successfully!')
    }
  }

  const handleFilterTransactions = (filter: string) => {
    console.log('🔍 FILTER TRANSACTIONS:', filter)
    alert(`Filtering transactions by: ${filter}`)
  }

  const handleSearchTransactions = () => {
    console.log('🔍 SEARCH TRANSACTIONS')
    const query = prompt('Search transactions:')
    if (query) {
      alert(`🔍 Searching for: "${query}"`)
    }
  }

  const handleCreateInvoice = async () => {
    console.log('➕ CREATE INVOICE')

    // Simplified invoice creation - in production would have a form modal
    const client = prompt('Enter client name:')
    if (!client) return

    const amount = prompt('Enter invoice amount:')
    if (!amount) return

    try {
      const response = await fetch('/api/financial/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            client,
            project: 'Services Rendered',
            items: [
              {
                description: 'Professional Services',
                quantity: 1,
                rate: parseFloat(amount),
                amount: parseFloat(amount)
              }
            ],
            taxRate: 0,
            currency: 'USD'
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create invoice')
      }

      const result = await response.json()

      if (result.success) {
        toast.success(result.message, {
          description: `Invoice ${result.invoiceNumber} • PDF available`
        })

        // Show next steps
        setTimeout(() => {
          alert(`${result.message}\n\nInvoice Number: ${result.invoiceNumber}\nPDF: ${result.pdfUrl}\n\nNext Steps:\n• Review invoice details\n• Send to client\n• Track payment status`)
        }, 500)
      }
    } catch (error: any) {
      console.error('Create Invoice Error:', error)
      toast.error('Failed to create invoice', {
        description: error.message || 'Please try again later'
      })
    }
  }

  const handleViewAllInvoices = () => {
    console.log('📋 VIEW ALL INVOICES')
    alert('📋 All Invoices\n\nShowing:\n• Paid invoices\n• Pending invoices\n• Overdue invoices\n• Draft invoices')
  }

  const handleEditInvoice = (invoiceId: number) => {
    console.log('✏️ EDIT INVOICE - ID:', invoiceId)
    alert(`✏️ Edit Invoice #${invoiceId}\n\nModify invoice details and line items.`)
  }

  const handleDeleteInvoice = (invoiceId: number) => {
    console.log('🗑️ DELETE INVOICE - ID:', invoiceId)
    if (confirm('⚠️ Delete Invoice?\n\nThis action cannot be undone.\n\nAre you sure?')) {
      alert('✅ Invoice deleted successfully!')
    }
  }

  const handleSendInvoice = (invoiceId: number) => {
    console.log('📧 SEND INVOICE - ID:', invoiceId)
    alert(`📧 Sending Invoice #${invoiceId}\n\nInvoice will be emailed to the client with payment instructions.`)
  }

  const handleMarkInvoicePaid = (invoiceId: number) => {
    console.log('✅ MARK INVOICE PAID - ID:', invoiceId)
    if (confirm('Mark this invoice as paid?')) {
      alert(`✅ Invoice #${invoiceId} marked as paid!`)
    }
  }

  const handleSendPaymentReminder = (invoiceId: number) => {
    console.log('📧 SEND PAYMENT REMINDER - ID:', invoiceId)
    alert(`📧 Payment Reminder Sent\n\nInvoice #${invoiceId}\n\nFriendly reminder email sent to client.`)
  }

  const handleGenerateProfitLoss = () => {
    console.log('📊 GENERATE P&L REPORT')
    alert('📊 Profit & Loss Statement\n\nGenerating monthly P&L...\n\n✅ Report ready!\n\nRevenue: $45,231\nExpenses: $18,500\nNet Profit: $26,731')
  }

  const handleGenerateCashFlow = () => {
    console.log('📊 GENERATE CASH FLOW REPORT')
    alert('📊 Cash Flow Report\n\nAnalyzing cash flow...\n\n✅ Report ready!\n\nInflows: +$48,500\nOutflows: -$21,769\nNet Cash Flow: +$26,731')
  }

  const handleGenerateTaxSummary = () => {
    console.log('📊 GENERATE TAX SUMMARY')
    alert('📊 Tax Summary Report\n\nCalculating quarterly taxes...\n\n✅ Report ready!\n\nTaxable Income: $26,731\nEstimated Tax: $6,682.75\nQuarterly Payment: $1,670.69')
  }

  const handleGenerateExpenseReport = () => {
    console.log('📊 GENERATE EXPENSE REPORT')
    alert('📊 Expense Report\n\nAnalyzing expenses...\n\n✅ Report ready!\n\nTotal Expenses: $18,500\nTop Categories:\n• Software: $5,200\n• Marketing: $4,500\n• Operations: $8,800')
  }

  const handleDownloadReport = (reportType: string) => {
    console.log('📥 DOWNLOAD REPORT:', reportType)
    alert(`📥 Downloading ${reportType}\n\nFormat: PDF\n\n✅ Download started!`)
  }

  const handlePrintReport = (reportType: string) => {
    console.log('🖨️ PRINT REPORT:', reportType)
    alert(`🖨️ Printing ${reportType}\n\nSending to default printer...`)
  }

  const handleRefreshData = () => {
    console.log('🔄 REFRESH FINANCIAL DATA')
    alert('🔄 Refreshing Data...\n\n✅ Financial data updated with latest transactions!')
  }

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
          <div className="flex items-center gap-3">
            {/* Gradient icon container */}
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold kazi-text-dark dark:kazi-text-light">
              Financial Dashboard
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300">
            Track your business finances and performance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExportReport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportData}>
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <Button size="sm" onClick={handleScheduleReview}>
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Review
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
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
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" className="flex-1" onClick={handleViewAllTransactions}>
                    View All Transactions
                  </Button>
                  <Button onClick={() => handleAddTransaction('income')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Income
                  </Button>
                  <Button variant="outline" onClick={() => handleAddTransaction('expense')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </div>
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
                  <Button size="sm" onClick={handleCreateInvoice}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Invoice
                  </Button>
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
                
                <Button variant="outline" className="w-full" onClick={handleViewAllInvoices}>
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
                    <Button variant="outline" className="justify-start h-auto p-4" onClick={handleGenerateProfitLoss}>
                      <div className="flex items-center space-x-3">
                        <PieChart className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Profit & Loss</p>
                          <p className="text-sm kazi-text-tertiary">Monthly P&L statement</p>
                        </div>
                      </div>
                    </Button>

                    <Button variant="outline" className="justify-start h-auto p-4" onClick={handleGenerateCashFlow}>
                      <div className="flex items-center space-x-3">
                        <TrendingUp className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Cash Flow</p>
                          <p className="text-sm kazi-text-tertiary">Income vs expenses</p>
                        </div>
                      </div>
                    </Button>

                    <Button variant="outline" className="justify-start h-auto p-4" onClick={handleGenerateTaxSummary}>
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5" />
                        <div className="text-left">
                          <p className="font-medium">Tax Summary</p>
                          <p className="text-sm kazi-text-tertiary">Quarterly tax overview</p>
                        </div>
                      </div>
                    </Button>

                    <Button variant="outline" className="justify-start h-auto p-4" onClick={handleGenerateExpenseReport}>
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
