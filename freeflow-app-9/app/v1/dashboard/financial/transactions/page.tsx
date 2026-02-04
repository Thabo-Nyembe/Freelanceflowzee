// MIGRATED: Batch #26 - Verified database hook integration
"use client"

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CardSkeleton, ListSkeleton } from '@/components/ui/loading-skeleton'
import { ErrorEmptyState, NoDataEmptyState } from '@/components/ui/empty-state'
import { createSimpleLogger } from '@/lib/simple-logger'
import { useCurrentUser } from '@/hooks/use-ai-data'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Search,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react'
import {
  formatCurrency,
  formatDate,
  getPaymentMethodLabel,
  getTransactionCategories,
  type Transaction
} from '@/lib/financial-hub-utils'
import type {
  FinancialTransaction,
  TransactionType,
  TransactionCategory,
  TransactionStatus,
  PaymentMethodType
} from '@/lib/financial-queries'

const logger = createSimpleLogger('TransactionsPage')

// Map database transaction to UI transaction type
function mapDbTransactionToUi(dbTxn: FinancialTransaction): Transaction {
  return {
    id: dbTxn.id,
    type: dbTxn.type,
    category: dbTxn.category,
    description: dbTxn.description,
    amount: dbTxn.amount,
    date: dbTxn.transaction_date,
    client: dbTxn.client_name,
    project: dbTxn.project_name,
    vendor: dbTxn.vendor_name,
    status: dbTxn.status as 'completed' | 'pending' | 'failed',
    paymentMethod: dbTxn.payment_method as 'bank_transfer' | 'credit_card' | 'paypal' | 'platform' | 'cash',
    invoice: dbTxn.invoice_number,
    recurring: dbTxn.is_recurring,
    nextDue: dbTxn.next_due_date,
    tags: dbTxn.tags || [],
    notes: dbTxn.notes,
    createdAt: dbTxn.created_at,
    updatedAt: dbTxn.updated_at
  }
}

interface TransactionFormData {
  type: TransactionType
  category: TransactionCategory
  description: string
  amount: number
  transaction_date: string
  client_name?: string
  vendor_name?: string
  status: TransactionStatus
  payment_method: PaymentMethodType
  notes?: string
}

export default function TransactionsPage() {
  // Authentication
  const { userId, loading: userLoading } = useCurrentUser()

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [formData, setFormData] = useState<TransactionFormData>({
    type: 'income',
    category: 'project_payment',
    description: '',
    amount: 0,
    transaction_date: new Date().toISOString().split('T')[0],
    status: 'completed',
    payment_method: 'bank_transfer',
  })

  // Confirmation Dialog State
  const [deleteTransaction, setDeleteTransaction] = useState<{ id: string; description: string } | null>(null)

  useEffect(() => {
    if (userLoading) return // Wait for auth to complete

    if (userId) {
      loadTransactions()
    } else {
      // No user logged in, stop loading
      setIsLoading(false)
    }
  }, [userId, userLoading])

  const loadTransactions = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      setError(null)

      logger.info('Loading transactions from database', { userId })

      // Import and call real database query
      const { getTransactions } = await import('@/lib/financial-queries')

      // Build filters based on current UI state
      const filters: any = {}
      if (filterType !== 'all') {
        filters.type = filterType
      }
      if (filterCategory !== 'all') {
        filters.category = filterCategory
      }
      if (searchTerm) {
        filters.search = searchTerm
      }

      const { data, error: dbError } = await getTransactions(userId, filters)

      if (dbError) {
        throw new Error(dbError.message || 'Failed to load transactions')
      }

      // Map database transactions to UI format
      const mappedTransactions = (data || []).map(mapDbTransactionToUi)
      setTransactions(mappedTransactions)
      setIsLoading(false)

      logger.info('Transactions loaded successfully', {
        count: mappedTransactions.length,
        userId
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions'
      setError(errorMessage)
      setIsLoading(false)
      logger.error('Failed to load transactions', { error: err, userId })
      toast.error('Failed to load transactions', {
        description: errorMessage
      })
    }
  }

  const filteredTransactions = useMemo(() => {
    logger.debug('Filtering transactions', { searchTerm, filterCategory, filterType })

    return transactions.filter(txn => {
      const matchesSearch = txn.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (txn.client?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                           (txn.vendor?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
      const matchesCategory = filterCategory === 'all' || txn.category === filterCategory
      const matchesType = filterType === 'all' || txn.type === filterType

      return matchesSearch && matchesCategory && matchesType
    })
  }, [transactions, searchTerm, filterCategory, filterType])

  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredTransactions.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredTransactions, currentPage])

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  const openAddDialog = (type: 'income' | 'expense') => {
    setEditingTransaction(null)
    setFormData({
      type,
      category: type === 'income' ? 'project_payment' : 'software',
      description: '',
      amount: 0,
      transaction_date: new Date().toISOString().split('T')[0],
      status: 'completed',
      payment_method: 'bank_transfer',
    })
    setIsDialogOpen(true)
    logger.info('Add transaction dialog opened', { type })
  }

  const openEditDialog = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setFormData({
      type: transaction.type,
      category: transaction.category as TransactionCategory,
      description: transaction.description,
      amount: transaction.amount,
      transaction_date: transaction.date,
      client_name: transaction.client,
      vendor_name: transaction.vendor,
      status: transaction.status as TransactionStatus,
      payment_method: transaction.paymentMethod as PaymentMethodType,
      notes: transaction.notes,
    })
    setIsDialogOpen(true)
    logger.info('Edit transaction dialog opened', { transactionId: transaction.id })
  }

  const handleSubmitTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    try {
      setIsSubmitting(true)

      if (editingTransaction) {
        // Update existing transaction
        logger.info('Updating transaction', { transactionId: editingTransaction.id })

        const { updateTransaction } = await import('@/lib/financial-queries')
        const { data, error } = await updateTransaction(
          editingTransaction.id,
          userId,
          {
            type: formData.type,
            category: formData.category,
            description: formData.description,
            amount: formData.amount,
            transaction_date: formData.transaction_date,
            client_name: formData.client_name,
            vendor_name: formData.vendor_name,
            status: formData.status,
            payment_method: formData.payment_method,
            notes: formData.notes,
          }
        )

        if (error) throw new Error(error.message)

        // Optimistically update UI
        setTransactions(prev =>
          prev.map(t => (t.id === editingTransaction.id ? mapDbTransactionToUi(data!) : t))
        )

        toast.success('Transaction updated', {
          description: 'Changes saved successfully'
        })

        logger.info('Transaction updated successfully', { transactionId: editingTransaction.id })
      } else {
        // Create new transaction
        logger.info('Creating new transaction', { type: formData.type })

        const { createTransaction } = await import('@/lib/financial-queries')
        const { data, error } = await createTransaction(userId, {
          type: formData.type,
          category: formData.category,
          description: formData.description,
          amount: formData.amount,
          transaction_date: formData.transaction_date,
          client_name: formData.client_name,
          vendor_name: formData.vendor_name,
          status: formData.status,
          payment_method: formData.payment_method,
          notes: formData.notes,
        })

        if (error) throw new Error(error.message)

        // Optimistically add to UI
        setTransactions(prev => [mapDbTransactionToUi(data!), ...prev])

        toast.success(`${formData.type === 'income' ? 'Income' : 'Expense'} added`, {
          description: 'Transaction created successfully'
        })

        logger.info('Transaction created successfully', { transactionId: data!.id })
      }

      setIsDialogOpen(false)
      setIsSubmitting(false)
    } catch (error) {
      logger.error('Failed to save transaction', { error })
      toast.error('Failed to save transaction', {
        description: error.message
      })
      setIsSubmitting(false)
    }
  }

  const handleDeleteTransaction = (transactionId: string, description: string) => {
    if (!userId) return
    logger.info('Delete transaction initiated', { transactionId })
    setDeleteTransaction({ id: transactionId, description })
  }

  const handleConfirmDeleteTransaction = async () => {
    if (!userId || !deleteTransaction) return

    try {
      const { deleteTransaction: deleteTransactionQuery } = await import('@/lib/financial-queries')
      const { success, error } = await deleteTransactionQuery(deleteTransaction.id, userId)

      if (error || !success) {
        throw new Error(error?.message || 'Failed to delete transaction')
      }

      // Optimistically remove from UI
      setTransactions(prev => prev.filter(t => t.id !== deleteTransaction.id))

      toast.success('Transaction deleted', {
        description: deleteTransaction.description
      })

      logger.info('Transaction deleted successfully', { transactionId: deleteTransaction.id })
    } catch (error) {
      logger.error('Failed to delete transaction', { error, transactionId: deleteTransaction.id })
      toast.error('Delete failed', { description: error.message })
    } finally {
      setDeleteTransaction(null)
    }
  }

  const handleExportTransactions = async () => {
    logger.info('Export transactions initiated', {
      count: filteredTransactions.length
    })

    try {
      const response = await fetch('/api/financial/transactions/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: filteredTransactions
        })
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Transactions exported', {
        description: `${filteredTransactions.length} transactions exported to CSV`
      })

      logger.info('Transactions exported', {
        count: filteredTransactions.length
      })
    } catch (error) {
      logger.error('Export failed', { error })
      toast.error('Export failed', { description: error.message })
    }
  }

  // Show loading state while authenticating or loading data
  if (userLoading || isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <ListSkeleton items={8} />
      </div>
    )
  }

  // Show authentication required state
  if (!userId) {
    return (
      <ErrorEmptyState
        error="Authentication required"
        action={{
          label: 'Sign In',
          onClick: () => window.location.href = '/login'
        }}
      />
    )
  }

  if (error) {
    return (
      <ErrorEmptyState
        error={error}
        action={{
          label: 'Retry',
          onClick: loadTransactions
        }}
      />
    )
  }

  if (transactions.length === 0) {
    return (
      <NoDataEmptyState
        entityName="transactions"
        description="Start tracking your finances by adding your first transaction"
        action={{
          label: 'Add Transaction',
          onClick: () => openAddDialog('income')
        }}
      />
    )
  }

  const categories = getTransactionCategories(transactions)
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {filteredTransactions.filter(t => t.type === 'income').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {filteredTransactions.filter(t => t.type === 'expense').length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalIncome - totalExpenses)}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {filteredTransactions.length} total transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search transactions, clients, vendors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.replace('_', ' ')}</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>
                Showing {paginatedTransactions.length} of {filteredTransactions.length} transactions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportTransactions}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button size="sm" onClick={() => openAddDialog('income')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
              <Button variant="outline" size="sm" onClick={() => openAddDialog('expense')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {paginatedTransactions.length === 0 ? (
              <NoDataEmptyState
                entityName="transactions"
                description="No transactions match your search criteria"
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchTerm('')
                    setFilterCategory('all')
                    setFilterType('all')
                  }
                }}
              />
            ) : (
              paginatedTransactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-full ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <TrendingDown className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{transaction.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-sm text-gray-500">{formatDate(transaction.date)}</p>
                        <Badge variant="outline" className="text-xs">
                          {transaction.category.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          {getPaymentMethodLabel(transaction.paymentMethod)}
                        </span>
                        {transaction.client && (
                          <span className="text-sm text-gray-500">• {transaction.client}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`text-right font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(transaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTransaction(transaction.id, transaction.description)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transaction Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleSubmitTransaction}>
            <DialogHeader>
              <DialogTitle>
                {editingTransaction ? 'Edit Transaction' : `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`}
              </DialogTitle>
              <DialogDescription>
                {editingTransaction
                  ? 'Update transaction details below'
                  : `Create a new ${formData.type} transaction`
                }
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Type */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    type: e.target.value as TransactionType,
                    category: e.target.value === 'income' ? 'project_payment' : 'software'
                  }))}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  disabled={editingTransaction !== null}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
              </div>

              {/* Category */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TransactionCategory }))}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  {formData.type === 'income' ? (
                    <>
                      <option value="project_payment">Project Payment</option>
                      <option value="consulting">Consulting</option>
                      <option value="subscription">Subscription</option>
                      <option value="other">Other</option>
                    </>
                  ) : (
                    <>
                      <option value="software">Software</option>
                      <option value="hardware">Hardware</option>
                      <option value="marketing">Marketing</option>
                      <option value="office_expenses">Office Expenses</option>
                      <option value="professional_services">Professional Services</option>
                      <option value="taxes">Taxes</option>
                      <option value="other">Other</option>
                    </>
                  )}
                </select>
              </div>

              {/* Description */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="col-span-3"
                  placeholder="Transaction description"
                  required
                />
              </div>

              {/* Amount */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                  className="col-span-3"
                  placeholder="0.00"
                  required
                />
              </div>

              {/* Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.transaction_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, transaction_date: e.target.value }))}
                  className="col-span-3"
                  required
                />
              </div>

              {/* Client/Vendor Name */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="clientVendor" className="text-right">
                  {formData.type === 'income' ? 'Client' : 'Vendor'}
                </Label>
                <Input
                  id="clientVendor"
                  value={formData.type === 'income' ? (formData.client_name || '') : (formData.vendor_name || '')}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    ...(formData.type === 'income'
                      ? { client_name: e.target.value }
                      : { vendor_name: e.target.value }
                    )
                  }))}
                  className="col-span-3"
                  placeholder={formData.type === 'income' ? 'Client name' : 'Vendor name'}
                />
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="paymentMethod" className="text-right">
                  Payment Method
                </Label>
                <select
                  id="paymentMethod"
                  value={formData.payment_method}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_method: e.target.value as PaymentMethodType }))}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="platform">Platform Payment</option>
                  <option value="cash">Cash</option>
                  <option value="crypto">Crypto</option>
                  <option value="check">Check</option>
                </select>
              </div>

              {/* Status */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Status
                </Label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as TransactionStatus }))}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {/* Notes */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="notes" className="text-right pt-2">
                  Notes
                </Label>
                <textarea
                  id="notes"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Additional notes (optional)"
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingTransaction ? 'Update' : 'Create'} Transaction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Transaction Confirmation Dialog */}
      <AlertDialog open={!!deleteTransaction} onOpenChange={() => setDeleteTransaction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{deleteTransaction?.description}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteTransaction}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
