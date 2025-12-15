'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface ReportInput {
  name: string
  description?: string
  type?: 'financial' | 'sales' | 'analytics' | 'performance' | 'custom'
  status?: 'draft' | 'generating' | 'ready' | 'scheduled' | 'archived'
  date_from?: string
  date_to?: string
  is_recurring?: boolean
  schedule_cron?: string
  config?: Record<string, any>
  filters?: Record<string, any>
  metadata?: Record<string, any>
}

export interface RevenueEntryInput {
  amount: number
  currency?: string
  type?: 'income' | 'expense' | 'refund'
  category?: string
  source?: string
  source_id?: string
  client_id?: string
  project_id?: string
  invoice_id?: string
  entry_date?: string
  description?: string
  metadata?: Record<string, any>
}

export async function getReports() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function getReport(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function createReport(input: ReportInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Get next report number
  const { data: lastReport } = await supabase
    .from('reports')
    .select('report_number')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  let reportNumber = 'RPT-0001'
  if (lastReport?.report_number) {
    const num = parseInt(lastReport.report_number.replace('RPT-', '')) + 1
    reportNumber = `RPT-${num.toString().padStart(4, '0')}`
  }

  const { data, error } = await supabase
    .from('reports')
    .insert({
      ...input,
      user_id: user.id,
      report_number: reportNumber,
      config: input.config || {},
      filters: input.filters || {},
      metadata: input.metadata || {}
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/reports-v2')
  return { data, error: null }
}

export async function updateReport(id: string, input: Partial<ReportInput>) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('reports')
    .update({
      ...input,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/reports-v2')
  return { data, error: null }
}

export async function deleteReport(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/reports-v2')
  return { success: true, error: null }
}

export async function generateReport(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  // Set status to generating
  const { error: updateError } = await supabase
    .from('reports')
    .update({
      status: 'generating',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: updateError.message, data: null }
  }

  // In production, this would trigger actual report generation
  // For now, we simulate completion
  const { data, error } = await supabase
    .from('reports')
    .update({
      status: 'ready',
      generated_at: new Date().toISOString(),
      data_points: Math.floor(Math.random() * 1000) + 100,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/reports-v2')
  return { data, error: null }
}

export async function archiveReport(id: string) {
  return updateReport(id, { status: 'archived' })
}

export async function scheduleReport(id: string, cronExpression: string) {
  return updateReport(id, {
    status: 'scheduled',
    is_recurring: true,
    schedule_cron: cronExpression
  })
}

// Revenue Entries

export async function getRevenueEntries(dateFrom?: string, dateTo?: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  let query = supabase
    .from('revenue_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('entry_date', { ascending: false })

  if (dateFrom) query = query.gte('entry_date', dateFrom)
  if (dateTo) query = query.lte('entry_date', dateTo)

  const { data, error } = await query

  if (error) {
    return { error: error.message, data: null }
  }

  return { data, error: null }
}

export async function createRevenueEntry(input: RevenueEntryInput) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const { data, error } = await supabase
    .from('revenue_entries')
    .insert({
      ...input,
      user_id: user.id,
      entry_date: input.entry_date || new Date().toISOString().split('T')[0],
      metadata: input.metadata || {}
    })
    .select()
    .single()

  if (error) {
    return { error: error.message, data: null }
  }

  revalidatePath('/dashboard/reports-v2')
  return { data, error: null }
}

export async function deleteRevenueEntry(id: string) {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', success: false }
  }

  const { error } = await supabase
    .from('revenue_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message, success: false }
  }

  revalidatePath('/dashboard/reports-v2')
  return { success: true, error: null }
}

export async function getReportStats() {
  const supabase = createServerActionClient({ cookies })
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated', data: null }
  }

  const [{ data: reports }, { data: revenue }] = await Promise.all([
    supabase
      .from('reports')
      .select('status')
      .eq('user_id', user.id),
    supabase
      .from('revenue_entries')
      .select('amount, type')
      .eq('user_id', user.id)
  ])

  const income = revenue?.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0) || 0
  const expenses = revenue?.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0) || 0
  const refunds = revenue?.filter(r => r.type === 'refund').reduce((sum, r) => sum + r.amount, 0) || 0

  const stats = {
    total: reports?.length || 0,
    draft: reports?.filter(r => r.status === 'draft').length || 0,
    ready: reports?.filter(r => r.status === 'ready').length || 0,
    scheduled: reports?.filter(r => r.status === 'scheduled').length || 0,
    archived: reports?.filter(r => r.status === 'archived').length || 0,
    totalRevenue: income,
    totalExpenses: expenses + refunds,
    netIncome: income - expenses - refunds
  }

  return { data: stats, error: null }
}
