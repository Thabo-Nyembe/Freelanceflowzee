'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly' | 'project'
export type BudgetCategory = 'operations' | 'marketing' | 'development' | 'design' | 'hr' | 'infrastructure' | 'other'

export interface Budget {
  id: string
  name: string
  category: BudgetCategory
  period: BudgetPeriod
  startDate: string
  endDate: string
  allocated: number
  spent: number
  remaining: number
  currency: string
  projectId?: string
  projectName?: string
  items: BudgetItem[]
  alerts: BudgetAlert[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface BudgetItem {
  id: string
  name: string
  planned: number
  actual: number
  variance: number
  category: string
}

export interface BudgetAlert {
  id: string
  type: 'warning' | 'critical'
  threshold: number
  message: string
  triggeredAt?: string
  isActive: boolean
}

export interface BudgetStats {
  totalAllocated: number
  totalSpent: number
  totalRemaining: number
  utilizationRate: number
  overBudgetCount: number
  underBudgetCount: number
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockBudgets: Budget[] = [
  { id: 'budget-1', name: 'Q1 Marketing Budget', category: 'marketing', period: 'quarterly', startDate: '2024-01-01', endDate: '2024-03-31', allocated: 50000, spent: 42000, remaining: 8000, currency: 'USD', items: [{ id: 'bi-1', name: 'Advertising', planned: 30000, actual: 28000, variance: 2000, category: 'ads' }, { id: 'bi-2', name: 'Content Creation', planned: 15000, actual: 12000, variance: 3000, category: 'content' }], alerts: [{ id: 'a1', type: 'warning', threshold: 80, message: '80% of budget utilized', triggeredAt: '2024-03-15', isActive: true }], isActive: true, createdAt: '2024-01-01', updatedAt: '2024-03-20' },
  { id: 'budget-2', name: 'Development Team', category: 'development', period: 'monthly', startDate: '2024-03-01', endDate: '2024-03-31', allocated: 25000, spent: 18500, remaining: 6500, currency: 'USD', items: [], alerts: [], isActive: true, createdAt: '2024-03-01', updatedAt: '2024-03-20' },
  { id: 'budget-3', name: 'Website Redesign Project', category: 'design', period: 'project', startDate: '2024-02-01', endDate: '2024-04-30', allocated: 15000, spent: 9800, remaining: 5200, currency: 'USD', projectId: 'proj-1', projectName: 'Website Redesign', items: [], alerts: [], isActive: true, createdAt: '2024-02-01', updatedAt: '2024-03-18' },
  { id: 'budget-4', name: 'Infrastructure', category: 'infrastructure', period: 'yearly', startDate: '2024-01-01', endDate: '2024-12-31', allocated: 120000, spent: 35000, remaining: 85000, currency: 'USD', items: [], alerts: [], isActive: true, createdAt: '2024-01-01', updatedAt: '2024-03-15' }
]

const mockStats: BudgetStats = {
  totalAllocated: 210000,
  totalSpent: 105300,
  totalRemaining: 104700,
  utilizationRate: 50.1,
  overBudgetCount: 0,
  underBudgetCount: 4
}

// ============================================================================
// HOOK
// ============================================================================

interface UseBudgetsOptions {
  
  projectId?: string
  category?: BudgetCategory
}

export function useBudgets(options: UseBudgetsOptions = {}) {
  const {  projectId, category } = options

  const [budgets, setBudgets] = useState<Budget[]>([])
  const [currentBudget, setCurrentBudget] = useState<Budget | null>(null)
  const [stats, setStats] = useState<BudgetStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchBudgets = useCallback(async (filters?: { category?: string; period?: string; isActive?: boolean }) => {
    try {
      const params = new URLSearchParams()
      if (filters?.category || category) params.set('category', filters?.category || category || '')
      if (filters?.period) params.set('period', filters.period)
      if (projectId) params.set('projectId', projectId)

      const response = await fetch(`/api/budgets?${params}`)
      const result = await response.json()
      if (result.success) {
        setBudgets(Array.isArray(result.budgets) ? result.budgets : [])
        setStats(Array.isArray(result.stats) ? result.stats : [])
        return result.budgets
      }
      setBudgets([])
      setStats(null)
      return []
    } catch (err) {
      setBudgets([])
      setStats(null)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [ projectId, category])

  const createBudget = useCallback(async (data: Omit<Budget, 'id' | 'spent' | 'remaining' | 'items' | 'alerts' | 'createdAt' | 'updatedAt'>) => {
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      if (result.success) {
        await fetchBudgets()
        return { success: true, budget: result.budget }
      }
      return { success: false, error: result.error }
    } catch (err) {
      const newBudget: Budget = { ...data, id: `budget-${Date.now()}`, spent: 0, remaining: data.allocated, items: [], alerts: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setBudgets(prev => [newBudget, ...prev])
      return { success: true, budget: newBudget }
    }
  }, [fetchBudgets])

  const updateBudget = useCallback(async (budgetId: string, updates: Partial<Budget>) => {
    try {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      const result = await response.json()
      if (result.success) {
        setBudgets(prev => prev.map(b => b.id === budgetId ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b))
      }
      return result
    } catch (err) {
      setBudgets(prev => prev.map(b => b.id === budgetId ? { ...b, ...updates } : b))
      return { success: true }
    }
  }, [])

  const deleteBudget = useCallback(async (budgetId: string) => {
    try {
      await fetch(`/api/budgets/${budgetId}`, { method: 'DELETE' })
      setBudgets(prev => prev.filter(b => b.id !== budgetId))
      return { success: true }
    } catch (err) {
      setBudgets(prev => prev.filter(b => b.id !== budgetId))
      return { success: true }
    }
  }, [])

  const addExpense = useCallback(async (budgetId: string, amount: number, description?: string) => {
    const budget = budgets.find(b => b.id === budgetId)
    if (budget) {
      const newSpent = budget.spent + amount
      const newRemaining = budget.allocated - newSpent
      return updateBudget(budgetId, { spent: newSpent, remaining: newRemaining })
    }
    return { success: false, error: 'Budget not found' }
  }, [budgets, updateBudget])

  const adjustAllocation = useCallback(async (budgetId: string, newAllocation: number) => {
    const budget = budgets.find(b => b.id === budgetId)
    if (budget) {
      return updateBudget(budgetId, { allocated: newAllocation, remaining: newAllocation - budget.spent })
    }
    return { success: false, error: 'Budget not found' }
  }, [budgets, updateBudget])

  const addAlert = useCallback(async (budgetId: string, alert: Omit<BudgetAlert, 'id' | 'triggeredAt'>) => {
    const budget = budgets.find(b => b.id === budgetId)
    if (budget) {
      const newAlert: BudgetAlert = { ...alert, id: `alert-${Date.now()}` }
      return updateBudget(budgetId, { alerts: [...budget.alerts, newAlert] })
    }
    return { success: false, error: 'Budget not found' }
  }, [budgets, updateBudget])

  const duplicateBudget = useCallback(async (budgetId: string) => {
    const budget = budgets.find(b => b.id === budgetId)
    if (budget) {
      const newBudget: Budget = { ...budget, id: `budget-${Date.now()}`, name: `${budget.name} (Copy)`, spent: 0, remaining: budget.allocated, alerts: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      setBudgets(prev => [newBudget, ...prev])
      return { success: true, budget: newBudget }
    }
    return { success: false, error: 'Budget not found' }
  }, [budgets])

  const refresh = useCallback(async () => {
    setIsLoading(true)
    await fetchBudgets()
  }, [fetchBudgets])

  useEffect(() => { refresh() }, [refresh])

  const activeBudgets = useMemo(() => budgets.filter(b => b.isActive), [budgets])
  const overBudget = useMemo(() => budgets.filter(b => b.spent > b.allocated), [budgets])
  const nearLimit = useMemo(() => budgets.filter(b => (b.spent / b.allocated) > 0.8 && b.spent <= b.allocated), [budgets])
  const budgetsByCategory = useMemo(() => {
    const grouped: Record<string, Budget[]> = {}
    budgets.forEach(b => {
      if (!grouped[b.category]) grouped[b.category] = []
      grouped[b.category].push(b)
    })
    return grouped
  }, [budgets])
  const totalAllocated = useMemo(() => budgets.reduce((sum, b) => sum + b.allocated, 0), [budgets])
  const totalSpent = useMemo(() => budgets.reduce((sum, b) => sum + b.spent, 0), [budgets])
  const utilizationRate = useMemo(() => totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0, [totalAllocated, totalSpent])

  return {
    budgets, currentBudget, stats, activeBudgets, overBudget, nearLimit, budgetsByCategory, totalAllocated, totalSpent, utilizationRate,
    isLoading, error,
    refresh, fetchBudgets, createBudget, updateBudget, deleteBudget, addExpense, adjustAllocation, addAlert, duplicateBudget,
    setCurrentBudget
  }
}

export default useBudgets
