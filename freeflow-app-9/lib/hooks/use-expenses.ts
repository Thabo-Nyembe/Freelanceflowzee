'use client'

import { useSupabaseQuery, useSupabaseMutation } from './base-hooks'

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
  custom_fields: any
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface UseExpensesOptions {
  category?: ExpenseCategory | 'all'
  status?: ExpenseStatus | 'all'
  department?: string | 'all'
}

export function useExpenses(options: UseExpensesOptions = {}) {
  const { category, status, department } = options

  const buildQuery = (supabase: any) => {
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

    return query
  }

  return useSupabaseQuery<Expense>('expenses', buildQuery, [category, status, department])
}

export function useCreateExpense() {
  return useSupabaseMutation<Expense>('expenses', 'insert')
}

export function useUpdateExpense() {
  return useSupabaseMutation<Expense>('expenses', 'update')
}

export function useDeleteExpense() {
  return useSupabaseMutation<Expense>('expenses', 'delete')
}
