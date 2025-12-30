"use client"

export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { TextShimmer } from '@/components/ui/text-shimmer'
import { CardSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import { createFeatureLogger } from '@/lib/logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import { useAnnouncer } from '@/lib/accessibility'
import {
  Brain,
  Target,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Download,
  FileText,
  DollarSign,
  PieChart
} from 'lucide-react'
import {
  formatCurrency,
  getInsightImpactColor,
  type Transaction,
  type Invoice,
  type FinancialInsight
} from '@/lib/financial-hub-utils'

const logger = createFeatureLogger('FinancialOverview')

export default function FinancialOverviewPage() {
  const { userId, loading: userLoading } = useCurrentUser()
  const { announce } = useAnnouncer()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [insights, setInsights] = useState<FinancialInsight[]>([])
  const [overview, setOverview] = useState<any>(null)

  // Add Transaction Modal State
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [transactionForm, setTransactionForm] = useState({
    type: 'income' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (userLoading) return // Wait for auth to complete

    if (userId) {
      loadFinancialOverview()
    } else {
      // No user logged in, stop loading
      setIsLoading(false)
    }
  }, [userId, userLoading])

  const loadFinancialOverview = async () => {
    if (!userId) {
      toast.error('Please log in to view financial data')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      logger.info('Loading financial overview from Supabase', { userId })

      // Dynamic import for code splitting
      const {
        getTransactions,
        getFinancialOverview,
        getFinancialInsights
      } = await import('@/lib/financial-queries')

      // Load data in parallel
      const [transactionsResult, overviewResult, insightsResult] = await Promise.all([
        getTransactions(userId, { startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }),
        getFinancialOverview(userId),
        getFinancialInsights(userId, { status: 'active' })
      ])

      if (transactionsResult.error || overviewResult.error || insightsResult.error) {
        throw new Error('Failed to load financial data')
      }

      // Transform transactions to UI format
      const transformedTransactions = (transactionsResult.data || []).map(t => ({
        id: t.id,
        type: t.type as 'income' | 'expense',
        category: t.category,
        description: t.description,
        amount: t.amount,
        date: t.transaction_date,
        client: t.client_name,
        project: t.project_name,
        vendor: t.vendor_name,
        status: t.status as any,
        paymentMethod: t.payment_method as any,
        invoice: t.invoice_number,
        recurring: t.is_recurring,
        nextDue: t.next_due_date,
        tags: t.tags,
        notes: t.notes,
        createdAt: t.created_at,
        updatedAt: t.updated_at
      }))
      setTransactions(transformedTransactions)

      // Use real overview data
      setOverview(overviewResult.data ? {
        totalRevenue: overviewResult.data.total_revenue || 0,
        monthlyRevenue: overviewResult.data.total_revenue || 0,
        totalExpenses: overviewResult.data.total_expenses || 0,
        netProfit: overviewResult.data.net_profit || 0,
        profitMargin: overviewResult.data.profit_margin || 0,
        monthlyGrowth: 0,
        quarterlyGrowth: 0,
        yearlyGrowth: 0,
        cashFlow: overviewResult.data.net_profit || 0,
        accountsReceivable: 0,
        accountsPayable: 0
      } : null)

      // Transform insights to UI format
      const transformedInsights = (insightsResult.data || []).map(i => ({
        id: i.id,
        type: i.type as any,
        title: i.title,
        description: i.description,
        impact: i.impact as any,
        potentialValue: i.potential_value,
        actionable: i.is_actionable,
        confidence: i.confidence,
        category: i.category as any
      }))
      setInsights(transformedInsights)

      // Invoices can be added when getInvoices query is available
      setInvoices([])

      setIsLoading(false)
      toast.success('Financial data loaded', {
        description: `${transformedTransactions.length} transactions, ${transformedInsights.length} insights`
      })
      logger.info('Financial overview loaded successfully from Supabase', {
        transactionCount: transformedTransactions.length,
        insightCount: transformedInsights.length,
        userId
      })
      announce('Financial overview loaded successfully', 'polite')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load financial overview'
      setError(errorMessage)
      setIsLoading(false)
      logger.error('Failed to load financial overview', { error: err, userId })
      toast.error('Failed to load financial data', { description: errorMessage })
      announce('Error loading financial overview', 'assertive')
    }
  }

  const handleExportData = async () => {
    logger.info('Export overview data initiated')

    try {
      const response = await fetch('/api/financial/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'overview',
          data: { transactions, invoices, overview }
        })
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `financial-overview-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Overview exported successfully', {
        description: `${transactions.length} transactions included`
      })
      logger.info('Overview exported', { transactionCount: transactions.length })
    } catch (error: any) {
      logger.error('Export failed', { error })
      toast.error('Export failed', { description: error.message })
    }
  }

  const handleAddTransaction = useCallback(async () => {
    if (!userId) {
      toast.error('Please log in to add transactions')
      return
    }

    const amount = parseFloat(transactionForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (!transactionForm.category) {
      toast.error('Please select a category')
      return
    }

    setIsSaving(true)
    announce('Adding transaction', 'polite')

    try {
      const { createTransaction } = await import('@/lib/financial-queries')

      const newTransaction = {
        type: transactionForm.type,
        amount: transactionForm.type === 'expense' ? -amount : amount,
        category: transactionForm.category,
        description: transactionForm.description || `${transactionForm.type} - ${transactionForm.category}`,
        date: transactionForm.date
      }

      const { data, error } = await createTransaction(userId, newTransaction)

      if (error) throw error

      // Add to local state
      setTransactions(prev => [data, ...prev])

      toast.success('Transaction added', {
        description: `${transactionForm.type === 'income' ? '+' : '-'}${formatCurrency(amount)}`
      })
      announce('Transaction added successfully', 'polite')

      // Reset form
      setTransactionForm({
        type: 'income',
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
      })
      setIsAddTransactionOpen(false)
    } catch (err: any) {
      logger.error('Failed to add transaction', { error: err })
      toast.error('Failed to add transaction')
      announce('Failed to add transaction', 'assertive')
    } finally {
      setIsSaving(false)
    }
  }, [userId, transactionForm, announce])

  const handleImplementInsight = async (insight: FinancialInsight) => {
    logger.info('Implement insight', { insightId: insight.id, title: insight.title })

    try {
      const response = await fetch('/api/financial/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'implement',
          insightId: insight.id
        })
      })

      if (!response.ok) throw new Error('Failed to implement insight')

      const result = await response.json()

      toast.success('Insight implementation started', {
        description: `Potential value: ${formatCurrency(insight.potentialValue)}`
      })

      logger.info('Insight implemented', {
        insightId: insight.id,
        potentialValue: insight.potentialValue
      })
    } catch (error: any) {
      logger.error('Failed to implement insight', { error, insightId: insight.id })
      toast.error('Implementation failed', { description: error.message })
    }
  }

  const handleGenerateReport = async (reportType: string) => {
    logger.info('Generate report from overview', { reportType })

    try {
      const response = await fetch('/api/financial/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportType,
          format: 'pdf',
          period: {
            start: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
            end: new Date().toISOString().split('T')[0]
          }
        })
      })

      if (!response.ok) throw new Error('Report generation failed')

      const result = await response.json()

      toast.success('Report generated', {
        description: `${reportType} report is ready`
      })

      logger.info('Report generated', { reportType, success: result.success })
    } catch (error: any) {
      logger.error('Report generation failed', { error, reportType })
      toast.error('Report generation failed', { description: error.message })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorEmptyState
        error={error}
        action={{
          label: 'Retry',
          onClick: loadFinancialOverview
        }}
      />
    )
  }

  if (transactions.length === 0 && invoices.length === 0) {
    return (
      <NoDataEmptyState
        entityName="financial data"
        description="Start tracking your finances by adding transactions and invoices"
        action={{
          label: 'Add Transaction',
          onClick: () => setIsAddTransactionOpen(true)
        }}
      />
    )
  }

  const recentTransactions = transactions.slice(0, 5)
  const upcomingPayments = invoices.filter(inv => inv.status !== 'paid').slice(0, 5)

  return (
    <div className="space-y-6">
      {/* AI Financial Intelligence Card */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-emerald-600" />
              <TextShimmer className="text-xl font-semibold">AI Financial Intelligence</TextShimmer>
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">Live Analysis</Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="border-emerald-300 hover:bg-emerald-100"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
          <CardDescription>AI-powered insights to optimize your financial performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${getInsightImpactColor(insight.impact)}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {insight.impact === 'high' && <Target className="h-4 w-4 text-red-600" />}
                    {insight.impact === 'medium' && <Lightbulb className="h-4 w-4 text-yellow-600" />}
                    {insight.impact === 'low' && <TrendingUp className="h-4 w-4 text-green-600" />}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">{insight.impact} impact</Badge>
                    <Badge variant="outline" className="text-xs">{insight.confidence}% confidence</Badge>
                  </div>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">{insight.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-emerald-600">
                    Potential: {formatCurrency(insight.potentialValue)}
                  </span>
                  {insight.actionable && (
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleImplementInsight(insight)}
                    >
                      Implement
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest income and expenses</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateReport('transactions')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
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
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Upcoming Payments</CardTitle>
                <CardDescription>Invoices due for payment</CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerateReport('invoices')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-blue-100">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{payment.client}</p>
                      <p className="text-sm text-gray-500">Due: {payment.dueDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(payment.amount)}</p>
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Generate financial reports and insights</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleGenerateReport('profit_loss')}
            >
              <div className="flex items-center gap-3">
                <PieChart className="h-5 w-5 text-emerald-600" />
                <div className="text-left">
                  <p className="font-medium">Profit & Loss</p>
                  <p className="text-sm text-gray-500">Monthly P&L</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleGenerateReport('cash_flow')}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium">Cash Flow</p>
                  <p className="text-sm text-gray-500">Income vs expenses</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleGenerateReport('tax_summary')}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-purple-600" />
                <div className="text-left">
                  <p className="font-medium">Tax Summary</p>
                  <p className="text-sm text-gray-500">Quarterly tax</p>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="justify-start h-auto p-4"
              onClick={() => handleGenerateReport('expense_report')}
            >
              <div className="flex items-center gap-3">
                <DollarSign className="h-5 w-5 text-red-600" />
                <div className="text-left">
                  <p className="font-medium">Expenses</p>
                  <p className="text-sm text-gray-500">Detailed report</p>
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Transaction Dialog */}
      <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Add Transaction
            </DialogTitle>
            <DialogDescription>
              Record a new income or expense transaction
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label>Type</Label>
              <select
                value={transactionForm.type}
                onChange={(e) =>
                  setTransactionForm(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))
                }
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-9"
                  value={transactionForm.amount}
                  onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={transactionForm.category}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select category</option>
                {transactionForm.type === 'income' ? (
                  <>
                    <option value="client_payment">Client Payment</option>
                    <option value="project_revenue">Project Revenue</option>
                    <option value="subscription">Subscription</option>
                    <option value="consulting">Consulting</option>
                    <option value="other_income">Other Income</option>
                  </>
                ) : (
                  <>
                    <option value="software">Software & Tools</option>
                    <option value="marketing">Marketing</option>
                    <option value="office">Office Expenses</option>
                    <option value="travel">Travel</option>
                    <option value="contractor">Contractor Payments</option>
                    <option value="utilities">Utilities</option>
                    <option value="other_expense">Other Expense</option>
                  </>
                )}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={transactionForm.date}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a note about this transaction..."
                value={transactionForm.description}
                onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsAddTransactionOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTransaction}
              disabled={isSaving || !transactionForm.amount || !transactionForm.category}
              className={transactionForm.type === 'income'
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-red-500 hover:bg-red-600'
              }
            >
              {isSaving ? 'Adding...' : `Add ${transactionForm.type === 'income' ? 'Income' : 'Expense'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
