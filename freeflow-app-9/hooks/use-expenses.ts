'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type ExpenseStatus = 'pending' | 'approved' | 'rejected' | 'reimbursed'
export type ExpenseCategory = 'travel' | 'meals' | 'office' | 'software' | 'equipment' | 'marketing' | 'professional' | 'utilities' | 'other'

export interface Expense {
  id: string
  title: string
  description?: string
  category: ExpenseCategory
  amount: number
  currency: string
  date: string
  status: ExpenseStatus
  projectId?: string
  projectName?: string
  clientId?: string
  clientName?: string
  vendorName?: string
  receipt?: ExpenseReceipt
  tags: string[]
  isBillable: boolean
  isReimbursable: boolean
  submittedBy: string
  approvedBy?: string
  approvedAt?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface ExpenseReceipt {
  id: string
  url: string
  fileName: string
  fileSize: number
  mimeType: string
}

export interface ExpenseReport {
  id: string
  name: string
  period: { start: string; end: string }
  expenses: string[]
  totalAmount: number
  status: 'draft' | 'submitted' | 'approved' | 'paid'
  submittedAt?: string
  approvedAt?: string
}

export interface ExpenseStats {
  totalExpenses: number
  pendingAmount: number
  approvedAmount: number
  reimbursedAmount: number
  expenseCount: number
  averageExpense: number
  topCategory: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockExpenses: Expense[] = [
  { id: 'exp-1', title: 'Client Lunch Meeting', category: 'meals', amount: 85.50, currency: 'USD', date: '2024-03-18', status: 'approved', clientId: 'client-1', clientName: 'Acme Corp', receipt: { id: 'r1', url: '/receipts/lunch.jpg', fileName: 'lunch-receipt.jpg', fileSize: 250000, mimeType: 'image/jpeg' }, tags: ['client', 'meeting'], isBillable: true, isReimbursable: false, submittedBy: 'user-1', approvedBy: 'manager-1', approvedAt: '2024-03-19', createdAt: '2024-03-18', updatedAt: '2024-03-19' },
  { id: 'exp-2', title: 'Adobe Creative Cloud Subscription', category: 'software', amount: 54.99, currency: 'USD', date: '2024-03-01', status: 'approved', tags: ['subscription', 'tools'], isBillable: false, isReimbursable: false, submittedBy: 'user-1', approvedBy: 'manager-1', approvedAt: '2024-03-02', createdAt: '2024-03-01', updatedAt: '2024-03-02' },
  { id: 'exp-3', title: 'Conference Travel', category: 'travel', amount: 450.00, currency: 'USD', date: '2024-03-15', status: 'pending', description: 'Flight and hotel for tech conference', tags: ['conference', 'travel'], isBillable: false, isReimbursable: true, submittedBy: 'user-1', createdAt: '2024-03-15', updatedAt: '2024-03-15' },
  { id: 'exp-4', title: 'Office Supplies', category: 'office', amount: 125.00, currency: 'USD', date: '2024-03-10', status: 'reimbursed', vendorName: 'Office Depot', tags: ['supplies'], isBillable: false, isReimbursable: true, submittedBy: 'user-1', approvedBy: 'manager-1', approvedAt: '2024-03-11', createdAt: '2024-03-10', updatedAt: '2024-03-12' },
  { id: 'exp-5', title: 'Project Equipment', category: 'equipment', amount: 899.00, currency: 'USD', date: '2024-03-20', status: 'pending', projectId: 'proj-1', projectName: 'Website Redesign', description: 'External monitor for design work', tags: ['equipment', 'project'], isBillable: true, isReimbursable: false, submittedBy: 'user-1', createdAt: '2024-03-20', updatedAt: '2024-03-20' }
]

const mockStats: ExpenseStats = {
  totalExpenses: 1614.49,
  pendingAmount: 1349.00,
  approvedAmount: 140.49,
  reimbursedAmount: 125.00,
  expenseCount: 5,
  averageExpense: 322.90,
  topCategory: 'equipment'
}

// ============================================================================
// HOOK
// ============================================================================

interface UseExpensesOptions {
  
  projectId?: string
  clientId?: string
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const {  projectId, clientId } = options

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null)
  const [reports, setReports] = useState<ExpenseReport[]>([])
  const [stats, setStats] = useState<ExpenseStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchExpenses = useCallback(async (filters?: { status?: string; category?: string; dateFrom?: string; dateTo?: string; search?: string }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.status) params.set('status', filters.status)
      if (filters?.category) params.set('category', filters.category)
      if (projectId) params.set('projectId', projectId)
      if (clientId) params.set('clientId', clientId)
      if (filters?.dateFrom) params.set('dateFrom', filters.dateFrom)
      if (filters?.dateTo) params.set('dateTo', filters.dateTo)
      if (filters?.search) params.set('search', filters.search)

      const response = await fetch(`/api/expenses?${params}`)
      const result = await response.json()
      if (result.success) {
        setExpenses(Array.isArray(result.expenses) ? result.expenses : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.expenses
      }
      setExpenses([])
      setStats(null)
      return []
    } catch (err) {
      setExpenses([])
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ projectId, clientId])

  const createExpense = useCallback(async (data: Omit<Expense, 'id' | 'status' | 'approvedBy' | 'approvedAt' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchExpenses()
        return { success: true, expense: result.expense }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newExpense: Expense = { ...data, id: `exp-${Date.now()}`, status: 'pending', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setExpenses(prev => [newExpense, ...prev])
      return { success: true, expense: newExpense }
    }
  }, [fetchExpenses])

  const updateExpense = useCallback(async (expenseId: string, updates: Partial<Expense>) => {
    try {
      const response = await fetch(`/api/expenses/${expenseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e))
      }
      return result
    } catch (err) {
      setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, ...updates } : e))
      return { success: true }
    }
  }, [])

  const deleteExpense = useCallback(async (expenseId: string) => {
    try {
      await fetch(`/api/expenses/${expenseId}`, { method: 'DELETE' })
      setExpenses(prev => prev.filter(e => e.id !== expenseId))
      return { success: true }
    } catch (err) {
      setExpenses(prev => prev.filter(e => e.id !== expenseId))
      return { success: true }
    }
  }, [])

  const approveExpense = useCallback(async (expenseId: string, approverId: string) => {
    return updateExpense(expenseId, { status: 'approved', approvedBy: approverId, approvedAt: new Date().toISOString() })
  }, [updateExpense])

  const rejectExpense = useCallback(async (expenseId: string, reason?: string) => {
    return updateExpense(expenseId, { status: 'rejected', notes: reason })
  }, [updateExpense])

  const markAsReimbursed = useCallback(async (expenseId: string) => {
    return updateExpense(expenseId, { status: 'reimbursed' })
  }, [updateExpense])

  const uploadReceipt = useCallback(async (expenseId: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('receipt', file)
      formData.append('expenseId', expenseId)

      const response = await fetch(`/api/expenses/${expenseId}/receipt`, { method: 'POST', body: formData })
      const result = await response.json()
      if (result.success) {
        setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, receipt: result.receipt } : e))
      }
      return result
    } catch (err) {
      const receipt: ExpenseReceipt = { id: `r-${Date.now()}`, url: URL.createObjectURL(file), fileName: file.name, fileSize: file.size, mimeType: file.type }
      setExpenses(prev => prev.map(e => e.id === expenseId ? { ...e, receipt } : e))
      return { success: true, receipt }
    }
  }, [])

  const createReport = useCallback(async (name: string, expenseIds: string[], period: { start: string; end: string }) => {
    const totalAmount = expenses.filter(e => expenseIds.includes(e.id)).reduce((sum, e) => sum + e.amount, 0)
    const newReport: ExpenseReport = { id: `report-${Date.now()}`, name, period, expenses: expenseIds, totalAmount, status: 'draft' }
    setReports(prev => [newReport, ...prev])
    return { success: true, report: newReport }
  }, [expenses])

  const submitReport = useCallback(async (reportId: string) => {
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'submitted' as const, submittedAt: new Date().toISOString() } : r))
    return { success: true }
  }, [])

  const search = useCallback((query: string) => {
    setSearchQuery(query)
    fetchExpenses({ search: query })
  }, [fetchExpenses])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchExpenses()
  }, [fetchExpenses])

  useEffect(() => { refresh() }, [refresh])

  const pendingExpenses = useMemo(() => expenses.filter(e => e.status === 'pending'), [expenses])
  const approvedExpenses = useMemo(() => expenses.filter(e => e.status === 'approved'), [expenses])
  const billableExpenses = useMemo(() => expenses.filter(e => e.isBillable), [expenses])
  const reimbursableExpenses = useMemo(() => expenses.filter(e => e.isReimbursable && e.status !== 'reimbursed'), [expenses])
  const expensesByCategory = useMemo(() => {
    const grouped: Record<string, Expense[]> = {}
    expenses.forEach(e => {
      if (!grouped[e.category]) grouped[e.category] = []
      grouped[e.category].push(e)
    })
    return grouped
  }, [expenses])
  const totalAmount = useMemo(() => expenses.reduce((sum, e) => sum + e.amount, 0), [expenses])
  const categories: ExpenseCategory[] = ['travel', 'meals', 'office', 'software', 'equipment', 'marketing', 'professional', 'utilities', 'other']

  return {
    expenses, currentExpense, reports, stats, pendingExpenses, approvedExpenses, billableExpenses, reimbursableExpenses, expensesByCategory, totalAmount, categories,
    isLoading, error, searchQuery,
    refresh, fetchExpenses, createExpense, updateExpense, deleteExpense, approveExpense, rejectExpense, markAsReimbursed, uploadReceipt, createReport, submitReport, search,
    setCurrentExpense
  }
}

export default useExpenses
