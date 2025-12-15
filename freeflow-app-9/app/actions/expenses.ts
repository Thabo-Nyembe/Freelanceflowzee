'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function createExpense(data: {
  expense_title: string
  amount: number
  expense_category: string
  description?: string
  expense_date?: string
  merchant_name?: string
}) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const totalAmount = data.amount

  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      user_id: user.id,
      ...data,
      total_amount: totalAmount,
      submitted_by: user.email || 'Unknown',
      submitted_by_id: user.id,
      submitted_at: new Date().toISOString(),
      status: 'pending'
    })
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/expenses-v2')
  return expense
}

export async function approveExpense(id: string, approvalNotes?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: expense, error } = await supabase
    .from('expenses')
    .update({
      status: 'approved',
      approved_by: user.email || 'Unknown',
      approved_by_id: user.id,
      approved_at: new Date().toISOString(),
      approval_notes: approvalNotes
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/expenses-v2')
  return expense
}

export async function rejectExpense(id: string, rejectionReason: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: expense, error } = await supabase
    .from('expenses')
    .update({
      status: 'rejected',
      reviewed_by: user.email || 'Unknown',
      reviewed_at: new Date().toISOString(),
      rejection_reason: rejectionReason
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/expenses-v2')
  return expense
}

export async function reimburseExpense(id: string, reimbursementMethod: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('expenses')
    .select('total_amount')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const { data: expense, error } = await supabase
    .from('expenses')
    .update({
      status: 'reimbursed',
      reimbursed: true,
      reimbursed_at: new Date().toISOString(),
      reimbursed_amount: current?.total_amount || 0,
      reimbursement_method: reimbursementMethod,
      payment_status: 'paid'
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/expenses-v2')
  return expense
}

export async function attachReceipt(id: string, receiptUrl: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: current } = await supabase
    .from('expenses')
    .select('receipt_urls, attachment_count')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  const receiptUrls = [...(current?.receipt_urls || []), receiptUrl]

  const { data: expense, error } = await supabase
    .from('expenses')
    .update({
      has_receipt: true,
      receipt_url: receiptUrl,
      receipt_urls: receiptUrls,
      attachment_count: receiptUrls.length
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/expenses-v2')
  return expense
}

export async function calculateMileageExpense(id: string, distanceMiles: number, ratePerMile: number) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const mileageAmount = parseFloat((distanceMiles * ratePerMile).toFixed(2))

  const { data: expense, error } = await supabase
    .from('expenses')
    .update({
      distance_miles: distanceMiles,
      mileage_rate: ratePerMile,
      amount: mileageAmount,
      total_amount: mileageAmount
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/expenses-v2')
  return expense
}

export async function markAsBillable(id: string, clientId: string, clientName: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: expense, error } = await supabase
    .from('expenses')
    .update({
      is_billable: true,
      client_id: clientId,
      client_name: clientName
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/expenses-v2')
  return expense
}

export async function flagPolicyViolation(id: string, violations: string[]) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: expense, error } = await supabase
    .from('expenses')
    .update({
      is_policy_compliant: false,
      policy_violations: violations,
      requires_justification: true
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/dashboard/expenses-v2')
  return expense
}
