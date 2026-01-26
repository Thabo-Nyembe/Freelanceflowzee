'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export type ExpenseCategory = 'travel' | 'meals' | 'supplies' | 'software' | 'entertainment' | 'accommodation' | 'transportation' | 'communication' | 'training' | 'other'
export type ExpenseStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'reimbursed' | 'cancelled' | 'under-review'

export interface Expense {
  id: string
  user_id: string
  expense_title: string
  description: string | null
  expense_category: ExpenseCategory
  amount: number
  currency: string
  tax_amount: number
  total_amount: number
  status: ExpenseStatus
  submitted_by: string | null
  submitted_by_id: string | null
  submitted_at: string | null
  expense_date: string | null
  approved_by: string | null
  approved_by_id: string | null
  approved_at: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  rejection_reason: string | null
  payment_method: string | null
  payment_status: string | null
  reimbursement_method: string | null
  reimbursed: boolean
  reimbursed_at: string | null
  reimbursed_amount: number
  has_receipt: boolean
  receipt_url: string | null
  receipt_urls: string[] | null
  attachment_count: number
  invoice_number: string | null
  merchant_name: string | null
  merchant_category: string | null
  merchant_location: string | null
  trip_id: string | null
  trip_name: string | null
  project_id: string | null
  project_name: string | null
  cost_center: string | null
  department: string | null
  distance_miles: number
  mileage_rate: number
  start_location: string | null
  end_location: string | null
  is_billable: boolean
  client_id: string | null
  client_name: string | null
  billed_to_client: boolean
  is_policy_compliant: boolean
  policy_violations: string[] | null
  requires_justification: boolean
  justification: string | null
  audit_notes: string | null
  approval_notes: string | null
  internal_notes: string | null
  is_recurring: boolean
  recurrence_frequency: string | null
  recurrence_end_date: string | null
  tags: string[] | null
  custom_fields: Record<string, unknown>
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface CreateExpenseInput {
  expense_title: string
  description?: string | null
  expense_category: ExpenseCategory
  amount: number
  currency?: string
  tax_amount?: number
  total_amount?: number
  status?: ExpenseStatus
  expense_date?: string | null
  payment_method?: string | null
  merchant_name?: string | null
  project_id?: string | null
  department?: string | null
  is_billable?: boolean
  tags?: string[] | null
}

export interface UpdateExpenseInput {
  id: string
  expense_title?: string
  description?: string | null
  expense_category?: ExpenseCategory
  amount?: number
  currency?: string
  tax_amount?: number
  total_amount?: number
  status?: ExpenseStatus
  expense_date?: string | null
  approved_by?: string | null
  approved_by_id?: string | null
  approved_at?: string | null
  rejection_reason?: string | null
  submitted_at?: string | null
  reimbursed?: boolean
  reimbursed_at?: string | null
  payment_method?: string | null
  merchant_name?: string | null
  receipt_url?: string | null
  receipt_urls?: string[] | null
  project_id?: string | null
  department?: string | null
  is_billable?: boolean
  tags?: string[] | null
}

interface UseExpensesOptions {
  category?: ExpenseCategory | 'all'
  status?: ExpenseStatus | 'all'
  department?: string | 'all'
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const { category, status, department } = options
  const [data, setData] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchExpenses = useCallback(async () => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('expenses')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (category && category !== 'all') {
        query = query.eq('expense_category', category)
      }

      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      if (department && department !== 'all') {
        query = query.eq('department', department)
      }

      const { data: expenses, error: queryError } = await query

      if (queryError) {
        throw new Error(queryError.message)
      }

      setData(expenses || [])
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to fetch expenses')
      setError(errorObj)
    } finally {
      setIsLoading(false)
    }
  }, [category, status, department])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  return { data, isLoading, error, refetch: fetchExpenses }
}

export function useCreateExpense() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(async (input: CreateExpenseInput): Promise<Expense | null> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to create an expense')
      }

      const expenseData = {
        ...input,
        user_id: user.id,
        currency: input.currency || 'USD',
        tax_amount: input.tax_amount || 0,
        total_amount: input.total_amount || input.amount,
        status: input.status || 'draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data: expense, error: insertError } = await supabase
        .from('expenses')
        .insert(expenseData)
        .select()
        .single()

      if (insertError) {
        throw new Error(insertError.message)
      }

      return expense as Expense
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to create expense')
      setError(errorObj)
      toast.error(errorObj.message)
      throw errorObj
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useUpdateExpense() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(async (input: UpdateExpenseInput): Promise<Expense | null> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to update an expense')
      }

      const { id, ...updateData } = input
      const dataToUpdate = {
        ...updateData,
        updated_at: new Date().toISOString()
      }

      const { data: expense, error: updateError } = await supabase
        .from('expenses')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single()

      if (updateError) {
        throw new Error(updateError.message)
      }

      return expense as Expense
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to update expense')
      setError(errorObj)
      toast.error(errorObj.message)
      throw errorObj
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}

export function useDeleteExpense() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(async (input: { id: string }): Promise<boolean> => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('You must be logged in to delete an expense')
      }

      // Soft delete by setting deleted_at
      const { error: deleteError } = await supabase
        .from('expenses')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', input.id)

      if (deleteError) {
        throw new Error(deleteError.message)
      }

      return true
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to delete expense')
      setError(errorObj)
      toast.error(errorObj.message)
      throw errorObj
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { mutate, isLoading, error }
}
