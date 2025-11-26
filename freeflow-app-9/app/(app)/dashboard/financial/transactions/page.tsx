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
import { createFeatureLogger } from '@/lib/logger'
import {
  Plus,
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import {
  MOCK_TRANSACTIONS,
  formatCurrency,
  formatDate,
  getPaymentMethodLabel,
  getTransactionCategories,
  type Transaction
} from '@/lib/financial-hub-utils'

const logger = createFeatureLogger('TransactionsPage')

export default function TransactionsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setIsLoading(true)
      setError(null)

      logger.info('Loading transactions')

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600))

      setTransactions(MOCK_TRANSACTIONS)
      setIsLoading(false)

      logger.info('Transactions loaded successfully', {
        count: MOCK_TRANSACTIONS.length
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transactions'
      setError(errorMessage)
      setIsLoading(false)
      logger.error('Failed to load transactions', { error: err })
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

  const handleAddTransaction = async (type: 'income' | 'expense') => {
    logger.info('Add transaction initiated', { type })

    try {
      const response = await fetch('/api/financial/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          data: {
            type,
            category: 'uncategorized',
            description: `New ${type}`,
            amount: 0,
            date: new Date().toISOString().split('T')[0],
            status: 'pending',
            paymentMethod: 'bank_transfer',
            tags: []
          }
        })
      })

      if (!response.ok) throw new Error('Failed to create transaction')

      const result = await response.json()

      toast.success(`${type === 'income' ? 'Income' : 'Expense'} added`, {
        description: 'Transaction created successfully'
      })

      logger.info('Transaction created', {
        type,
        transactionId: result.transactionId
      })

      // Reload transactions
      await loadTransactions()
    } catch (error: any) {
      logger.error('Failed to create transaction', { error, type })
      toast.error('Failed to create transaction', {
        description: error.message
      })
    }
  }

  const handleEditTransaction = async (transactionId: string) => {
    logger.info('Edit transaction initiated', { transactionId })

    try {
      const response = await fetch('/api/financial/transactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          transactionId,
          data: {
            // In production, would open a modal with form
            description: 'Updated transaction'
          }
        })
      })

      if (!response.ok) throw new Error('Failed to update transaction')

      toast.success('Transaction updated', {
        description: 'Changes saved successfully'
      })

      logger.info('Transaction updated', { transactionId })

      await loadTransactions()
    } catch (error: any) {
      logger.error('Failed to update transaction', { error, transactionId })
      toast.error('Update failed', { description: error.message })
    }
  }

  const handleDeleteTransaction = async (transactionId: string, description: string) => {
    logger.info('Delete transaction initiated', { transactionId })

    if (!confirm(`Delete transaction: ${description}?`)) return

    try {
      const response = await fetch('/api/financial/transactions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          transactionId
        })
      })

      if (!response.ok) throw new Error('Failed to delete transaction')

      toast.success('Transaction deleted', {
        description: description
      })

      logger.info('Transaction deleted', { transactionId })

      await loadTransactions()
    } catch (error: any) {
      logger.error('Failed to delete transaction', { error, transactionId })
      toast.error('Delete failed', { description: error.message })
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
    } catch (error: any) {
      logger.error('Export failed', { error })
      toast.error('Export failed', { description: error.message })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <CardSkeleton />
        <ListSkeleton items={8} />
      </div>
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
          onClick: () => handleAddTransaction('income')
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
              onChange={(e) => setFilterType(e.target.value as any)}
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
              <Button size="sm" onClick={() => handleAddTransaction('income')}>
                <Plus className="h-4 w-4 mr-2" />
                Add Income
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleAddTransaction('expense')}>
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
                        onClick={() => handleEditTransaction(transaction.id)}
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
    </div>
  )
}
