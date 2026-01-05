'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type TransactionType = 'income' | 'expense' | 'transfer' | 'refund'
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'cancelled'
export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'stripe' | 'cash' | 'check' | 'crypto'

export interface Transaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: number
  currency: string
  description: string
  category: string
  paymentMethod: PaymentMethod
  reference?: string
  invoiceId?: string
  clientId?: string
  clientName?: string
  projectId?: string
  projectName?: string
  date: string
  processedAt?: string
  metadata?: Record<string, any>
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface TransactionStats {
  totalIncome: number
  totalExpenses: number
  netIncome: number
  pendingAmount: number
  transactionCount: number
  averageTransaction: number
}

export interface TransactionCategory {
  id: string
  name: string
  type: 'income' | 'expense' | 'both'
  color: string
  icon: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockTransactions: Transaction[] = [
  { id: 'txn-1', type: 'income', status: 'completed', amount: 5500, currency: 'USD', description: 'Invoice #INV-2024-001 Payment', category: 'Client Payment', paymentMethod: 'bank_transfer', reference: 'TXN-ABC123', invoiceId: 'inv-1', clientId: 'client-1', clientName: 'Acme Corp', date: '2024-03-15', processedAt: '2024-03-15', createdAt: '2024-03-15', updatedAt: '2024-03-15' },
  { id: 'txn-2', type: 'expense', status: 'completed', amount: 54.99, currency: 'USD', description: 'Adobe Creative Cloud', category: 'Software', paymentMethod: 'credit_card', date: '2024-03-01', processedAt: '2024-03-01', createdAt: '2024-03-01', updatedAt: '2024-03-01' },
  { id: 'txn-3', type: 'income', status: 'pending', amount: 8850, currency: 'USD', description: 'Invoice #INV-2024-002 Payment', category: 'Client Payment', paymentMethod: 'stripe', invoiceId: 'inv-2', clientId: 'client-2', clientName: 'Tech Solutions', date: '2024-03-20', createdAt: '2024-03-20', updatedAt: '2024-03-20' },
  { id: 'txn-4', type: 'expense', status: 'completed', amount: 450, currency: 'USD', description: 'Conference Travel Expenses', category: 'Travel', paymentMethod: 'credit_card', reference: 'EXP-2024-003', date: '2024-03-18', processedAt: '2024-03-18', createdAt: '2024-03-18', updatedAt: '2024-03-18' },
  { id: 'txn-5', type: 'refund', status: 'completed', amount: 250, currency: 'USD', description: 'Partial refund for cancelled service', category: 'Refund', paymentMethod: 'stripe', clientId: 'client-3', clientName: 'StartUp Inc', date: '2024-03-10', processedAt: '2024-03-10', createdAt: '2024-03-10', updatedAt: '2024-03-10' },
  { id: 'txn-6', type: 'transfer', status: 'completed', amount: 5000, currency: 'USD', description: 'Transfer to savings account', category: 'Transfer', paymentMethod: 'bank_transfer', date: '2024-03-05', processedAt: '2024-03-05', createdAt: '2024-03-05', updatedAt: '2024-03-05' }
]

const mockStats: TransactionStats = {
  totalIncome: 14350,
  totalExpenses: 504.99,
  netIncome: 13845.01,
  pendingAmount: 8850,
  transactionCount: 6,
  averageTransaction: 2392.50
}

const mockCategories: TransactionCategory[] = [
  { id: 'cat-1', name: 'Client Payment', type: 'income', color: '#10B981', icon: 'dollar-sign' },
  { id: 'cat-2', name: 'Software', type: 'expense', color: '#3B82F6', icon: 'code' },
  { id: 'cat-3', name: 'Travel', type: 'expense', color: '#F59E0B', icon: 'plane' },
  { id: 'cat-4', name: 'Marketing', type: 'expense', color: '#EC4899', icon: 'megaphone' },
  { id: 'cat-5', name: 'Transfer', type: 'both', color: '#6366F1', icon: 'arrows-right-left' },
  { id: 'cat-6', name: 'Refund', type: 'both', color: '#EF4444', icon: 'undo' }
]

// ============================================================================
// HOOK
// ============================================================================

interface UseTransactionsOptions {
  
  clientId?: string
  projectId?: string
}

export function useTransactions(options: UseTransactionsOptions = {}) {
  const {  clientId, projectId } = options

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)
  const [categories, setCategories] = useState<TransactionCategory[]>([])
  const [stats, setStats] = useState<TransactionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchTransactions = useCallback(async (filters?: { type?: string; status?: string; category?: string; dateFrom?: string; dateTo?: string; search?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.type) params.set('type', filters.type)
      if (filters?.status) params.set('status', filters.status)
      if (filters?.category) params.set('category', filters.category)
      if (clientId) params.set('clientId', clientId)
      if (projectId) params.set('projectId', projectId)
      if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.set('dateTo', filters.dateTo)
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/transactions?${params}`)
      const result = await response.json()
      if (result.success) {
        setTransactions(Array.isArray(result.transactions) ? result.transactions : [])
        setCategories(Array.isArray(result.categories) ? result.categories : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.transactions
      }
      setTransactions([])
      setCategories(mockCategories)
      setStats(null)
      return []
    } catch (err) {
      setTransactions([])
      setCategories(mockCategories)
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ clientId, projectId])

  const createTransaction = useCallback(async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchTransactions()
        return { success: true, transaction: result.transaction }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newTransaction: Transaction = { ...data, id: `txn-${Date.now()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setTransactions(prev => [newTransaction, ...prev])
      return { success: true, transaction: newTransaction }
    }
  }, [fetchTransactions])

  const updateTransaction = useCallback(async (transactionId: string, updates: Partial<Transaction>) => {
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t))
      }
      return result
    } catch (err) {
      setTransactions(prev => prev.map(t => t.id === transactionId ? { ...t, ...updates } : t))
      return { success: true }
    }
  }, [])

  const deleteTransaction = useCallback(async (transactionId: string) => {
    try {
      await fetch(`/api/transactions/${transactionId}`, { method: 'DELETE' })
      setTransactions(prev => prev.filter(t => t.id !== transactionId))
      return { success: true }
    } catch (err) {
      setTransactions(prev => prev.filter(t => t.id !== transactionId))
      return { success: true }
    }
  }, [])

  const processTransaction = useCallback(async (transactionId: string) => {
    return updateTransaction(transactionId, { status: 'completed', processedAt: new Date().toISOString() })
  }, [updateTransaction])

  const cancelTransaction = useCallback(async (transactionId: string, reason?: string) => {
    return updateTransaction(transactionId, { status: 'cancelled', notes: reason })
  }, [updateTransaction])

  const refundTransaction = useCallback(async (transactionId: string, amount?: number) => {
    const transaction = transactions.find(t => t.id === transactionId)
    if (transaction) {
      const refundAmount = amount || transaction.amount
      const refundData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'> = {
        type: 'refund',
        status: 'pending',
        amount: refundAmount,
        currency: transaction.currency,
        description: `Refund for ${transaction.description}`,
        category: 'Refund',
        paymentMethod: transaction.paymentMethod,
        reference: `REF-${transaction.reference || transaction.id}`,
        clientId: transaction.clientId,
        clientName: transaction.clientName,
        date: new Date().toISOString().split('T')[0]
      }
      return createTransaction(refundData)
    }
    return { success: false, error: 'Transaction not found' }
  }, [transactions, createTransaction])

  const exportTransactions = useCallback(async (format: 'csv' | 'pdf' | 'excel', filters?: any) => {
    try {
      const response = await fetch(`/api/transactions/export?format=${format}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters || {})
      })
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions.${format}`
      a.click()
      return { success: true }
    } catch (err) {
      return { success: false, error: 'Failed to export' }
    }
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchTransactions({ search: query })
  }, [fetchTransactions])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchTransactions()
  }, [fetchTransactions])

  useEffect(() => { refresh() }, [refresh])

  const incomeTransactions = useMemo(() => transactions.filter(t => t.type === 'income'), [transactions])
  const expenseTransactions = useMemo(() => transactions.filter(t => t.type === 'expense'), [transactions])
  const pendingTransactions = useMemo(() => transactions.filter(t => t.status === 'pending'), [transactions])
  const recentTransactions = useMemo(() => [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10), [transactions])
  const transactionsByCategory = useMemo(() => {
    const grouped: Record<string, Transaction[]> = {}
    transactions.forEach(t => {
      if (!grouped[t.category]) grouped[t.category] = []
      grouped[t.category].push(t)
    })
    return grouped
  }, [transactions])
  const totalIncome = useMemo(() => incomeTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0), [incomeTransactions])
  const totalExpenses = useMemo(() => expenseTransactions.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.amount, 0), [expenseTransactions])
  const netIncome = useMemo(() => totalIncome - totalExpenses, [totalIncome, totalExpenses])

  return {
    transactions, currentTransaction, categories, stats, incomeTransactions, expenseTransactions, pendingTransactions, recentTransactions, transactionsByCategory, totalIncome, totalExpenses, netIncome,
    isLoading, error, searchQuery,
    refresh, fetchTransactions, createTransaction, updateTransaction, deleteTransaction, processTransaction, cancelTransaction, refundTransaction, exportTransactions, search,
    setCurrentTransaction
  }
}

export default useTransactions
