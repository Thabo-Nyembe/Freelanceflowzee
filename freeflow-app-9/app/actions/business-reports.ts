'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export interface ReportInput {
  title: string
  description?: string
  report_type?: 'financial' | 'operational' | 'custom' | 'analytics' | 'sales'
  schedule?: 'on-demand' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  file_format?: string
  data_range_start?: string
  data_range_end?: string
  filters?: Record<string, any>
}

export async function createReport(input: ReportInput) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('business_reports')
    .insert({
      user_id: user.id,
      title: input.title,
      description: input.description || null,
      report_type: input.report_type || 'custom',
      schedule: input.schedule || 'on-demand',
      file_format: input.file_format || 'pdf',
      data_range_start: input.data_range_start || null,
      data_range_end: input.data_range_end || null,
      filters: input.filters || {}
    })
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/reporting-v2')
  return { data }
}

export async function updateReport(id: string, updates: Partial<ReportInput>) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('business_reports')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/reporting-v2')
  return { data }
}

export async function deleteReport(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { error } = await supabase
    .from('business_reports')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/reporting-v2')
  return { success: true }
}

export async function generateReport(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Set status to generating
  const { error: updateError } = await supabase
    .from('business_reports')
    .update({
      status: 'generating',
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (updateError) {
    return { error: updateError.message }
  }

  // In a real app, this would trigger an async job
  // For now, we'll simulate completion
  const { data, error } = await supabase
    .from('business_reports')
    .update({
      status: 'ready',
      last_generated_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/reporting-v2')
  return { data }
}

export async function viewReport(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: report } = await supabase
    .from('business_reports')
    .select('views_count')
    .eq('id', id)
    .single()

  if (!report) {
    return { error: 'Report not found' }
  }

  const { data, error } = await supabase
    .from('business_reports')
    .update({
      views_count: report.views_count + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/reporting-v2')
  return { data }
}

export async function downloadReport(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: report } = await supabase
    .from('business_reports')
    .select('downloads_count, file_url')
    .eq('id', id)
    .single()

  if (!report) {
    return { error: 'Report not found' }
  }

  const { data, error } = await supabase
    .from('business_reports')
    .update({
      downloads_count: report.downloads_count + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/reporting-v2')
  return { data, downloadUrl: report.file_url }
}

export async function shareReport(id: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: report } = await supabase
    .from('business_reports')
    .select('shares_count')
    .eq('id', id)
    .single()

  if (!report) {
    return { error: 'Report not found' }
  }

  const { data, error } = await supabase
    .from('business_reports')
    .update({
      shares_count: report.shares_count + 1,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/reporting-v2')
  return { data }
}

export async function scheduleReport(id: string, schedule: string, nextScheduledAt?: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated' }
  }

  const { data, error } = await supabase
    .from('business_reports')
    .update({
      schedule,
      next_scheduled_at: nextScheduledAt || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/reporting-v2')
  return { data }
}

export async function getReports() {
  const supabase = createServerActionClient({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: 'Not authenticated', data: [] }
  }

  const { data, error } = await supabase
    .from('business_reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return { error: error.message, data: [] }
  }

  return { data }
}
